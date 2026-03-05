import React from 'react';

const UserProfileHeader = ({ user }) => {
    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <h3 className="font-bold text-gray-800">
                    {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden border-2 border-white">
                {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                )}
            </div>
        </div>
    );
};

export default UserProfileHeader;
