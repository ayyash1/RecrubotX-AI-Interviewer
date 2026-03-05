/**
 * Conversation State Machine
 * 
 * Manages the state transitions for real-time conversational AI interviews.
 * Enforces the Singleton pattern and mandatory state transitions.
 */

export const ConversationState = {
    IDLE: 'IDLE',                           // Initial state
    LISTENING: 'LISTENING',                 // Waiting for user input
    PROCESSING: 'PROCESSING',               // Processing input / generating response
    AI_SPEAKING: 'AI_SPEAKING',            // AI audio playing
    CANDIDATE_INTERRUPTING: 'CANDIDATE_INTERRUPTING' // User spoke over AI
};

/**
 * MANDATORY STATE TRANSITIONS
 * Strictly enforced to prevent invalid flows.
 */
const VALID_TRANSITIONS = {
    [ConversationState.IDLE]: [
        ConversationState.LISTENING         // Session started
    ],

    [ConversationState.LISTENING]: [
        ConversationState.PROCESSING,       // User finished speaking (VAD -> backend)
        ConversationState.AI_SPEAKING       // Timeout / Silence prompts
    ],

    [ConversationState.PROCESSING]: [
        ConversationState.AI_SPEAKING       // Response ready & audio received
    ],

    [ConversationState.AI_SPEAKING]: [
        ConversationState.LISTENING,        // Audio finished naturally
        ConversationState.CANDIDATE_INTERRUPTING // User interrupted
    ],

    [ConversationState.CANDIDATE_INTERRUPTING]: [
        ConversationState.LISTENING         // Resume listening immediately
    ]
};

class ConversationStateMachine {
    constructor() {
        if (ConversationStateMachine.instance) {
            return ConversationStateMachine.instance;
        }

        this.currentState = ConversationState.IDLE;
        this.listeners = [];
        this.history = [{ state: this.currentState, timestamp: Date.now() }];

        ConversationStateMachine.instance = this;
    }

    /**
     * Get current state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Attempt to transition to a new state
     * @param {string} newState - Target state
     * @param {object} metadata - Optional metadata about the transition
     * @returns {boolean} - Success status
     */
    transition(newState, metadata = {}) {
        const validNextStates = VALID_TRANSITIONS[this.currentState] || [];

        if (!validNextStates.includes(newState)) {
            console.warn(
                `[State Machine] ⛔ INVALID TRANSITION: ${this.currentState} → ${newState}. ` +
                `Valid: ${validNextStates.join(', ')}`
            );
            return false;
        }

        const previousState = this.currentState;
        this.currentState = newState;

        const transitionEvent = {
            from: previousState,
            to: newState,
            timestamp: Date.now(),
            metadata
        };

        this.history.push({
            state: newState,
            ...transitionEvent
        });

        console.log(
            `[State Machine] ✅ ${previousState} → ${newState}`,
            metadata
        );

        this.notifyListeners(transitionEvent);
        return true;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    /**
     * Notify all listeners
     */
    notifyListeners(event) {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (err) {
                console.error('[State Machine] Listener error:', err);
            }
        });
    }

    /**
     * Reset state machine to IDLE (e.g., on disconnect)
     */
    reset() {
        console.log('[State Machine] 🔄 Resetting to IDLE');
        // Force reset, ignoring transitions
        this.currentState = ConversationState.IDLE;
        this.history = [{ state: ConversationState.IDLE, timestamp: Date.now() }];
        this.notifyListeners({
            from: 'RESET',
            to: ConversationState.IDLE,
            timestamp: Date.now()
        });
    }

    // --- Helper Methods for Component Logic ---

    /**
     * Should Microphone be Active (Recording)?
     */
    shouldRecordAudio() {
        return this.currentState === ConversationState.LISTENING;
    }

    /**
     * Should Microphone monitor for Interruptions (No recording, just VAD)?
     */
    shouldDetectInterrupt() {
        return this.currentState === ConversationState.AI_SPEAKING;
    }

    /**
     * Is AI currently speaking?
     */
    isAiSpeaking() {
        return this.currentState === ConversationState.AI_SPEAKING;
    }
}

// Export singleton instance
export const conversationStateMachine = new ConversationStateMachine();
export default ConversationStateMachine;
