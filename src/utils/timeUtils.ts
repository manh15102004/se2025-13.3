/**
 * Calculate relative time from lastSeen timestamp
 * @param lastSeen - Last seen timestamp (string, Date, or null)
 * @returns Formatted relative time string in Vietnamese
 */
export const getRelativeTime = (lastSeen: string | Date | null): string => {
    if (!lastSeen) return 'Chưa cập nhật';

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);

    // Check if date is valid
    if (isNaN(lastSeenDate.getTime())) {
        return 'Chưa cập nhật';
    }

    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Online if within last 5 minutes
    if (diffMinutes < 5) {
        return 'Online';
    }

    // Calculate relative time
    if (diffMinutes < 60) {
        return `Offline ${diffMinutes} phút trước`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `Offline ${diffHours} giờ trước`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
        return `Offline ${diffDays} ngày trước`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    return `Offline ${diffMonths} tháng trước`;
};

/**
 * Check if user is currently online
 * @param lastSeen - Last seen timestamp (string, Date, or null)
 * @returns true if user is online (within last 5 minutes)
 */
export const isUserOnline = (lastSeen: string | Date | null): boolean => {
    if (!lastSeen) return false;

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);

    // Check if date is valid
    if (isNaN(lastSeenDate.getTime())) {
        return false;
    }

    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    return diffMinutes < 5;
};
