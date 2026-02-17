import { useState, useEffect, useRef } from 'react';
import ConversationStateMachine, { ConversationState } from '../services/ConversationStateMachine';

/**
 * React Hook for Conversation State Machine
 * 
 * Provides state management and helper functions for real-time conversation.
 * 
 * Usage:
 * const { state, transition, canInterrupt, isMicActive } = useConversationState();
 */
export function useConversationState() {
    const [currentState, setCurrentState] = useState(ConversationState.IDLE);
    const stateMachineRef = useRef(null);

    // Initialize state machine once
    useEffect(() => {
        // Create new instance
        stateMachineRef.current = new ConversationStateMachine(ConversationState.IDLE);

        // Subscribe to state changes
        const unsubscribe = stateMachineRef.current.subscribe((transitionData) => {
            setCurrentState(transitionData.to);
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    /**
     * Transition to a new state
     */
    const transition = (newState, metadata = {}) => {
        if (!stateMachineRef.current) return false;
        return stateMachineRef.current.transition(newState, metadata);
    };

    /**
     * Force state (bypass validation)
     */
    const forceState = (newState, metadata = {}) => {
        if (!stateMachineRef.current) return;
        stateMachineRef.current.forceState(newState, metadata);
    };

    /**
     * Check if can transition to target state
     */
    const canTransitionTo = (targetState) => {
        if (!stateMachineRef.current) return false;
        return stateMachineRef.current.canTransitionTo(targetState);
    };

    /**
     * Get valid next states
     */
    const getValidNextStates = () => {
        if (!stateMachineRef.current) return [];
        return stateMachineRef.current.getValidNextStates();
    };

    /**
     * Reset to IDLE
     */
    const reset = () => {
        if (!stateMachineRef.current) return;
        stateMachineRef.current.reset();
    };

    /**
     * Helper: Check if microphone should be active
     */
    const isMicrophoneActive = () => {
        if (!stateMachineRef.current) return false;
        return stateMachineRef.current.isMicrophoneActive();
    };

    /**
     * Helper: Check if AI can be interrupted
     */
    const isInterruptible = () => {
        if (!stateMachineRef.current) return false;
        return stateMachineRef.current.isInterruptible();
    };

    /**
     * Helper: Check if conversation is active
     */
    const isActive = () => {
        if (!stateMachineRef.current) return false;
        return stateMachineRef.current.isActive();
    };

    /**
     * Get state history
     */
    const getHistory = (limit = 10) => {
        if (!stateMachineRef.current) return [];
        return stateMachineRef.current.getHistory(limit);
    };

    return {
        // Current state
        state: currentState,

        // Core methods
        transition,
        forceState,
        reset,

        // Query methods
        canTransitionTo,
        getValidNextStates,
        getHistory,

        // Helper flags
        isMicrophoneActive: isMicrophoneActive(),
        isInterruptible: isInterruptible(),
        isActive: isActive(),

        // State constants for convenience
        States: ConversationState
    };
}

export default useConversationState;
