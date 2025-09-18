export function getStatusColor(status: string): 'success' | 'error' | 'warning' | 'default' | 'secondary' | 'primary' | 'info' {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'open':
      return 'success'; // Green
    case 'ended':
    case 'closed':
      return 'error'; // Red
    case 'pending':
      return 'warning'; // Yellow
    case 'cancelled':
      return 'default'; // Gray
    case 'draft':
      return 'secondary'; // Purple
    default:
      return 'default'; // Default gray
  }
}

export function getStatusText(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'Active';
    case 'ended':
      return 'Ended';
    case 'pending':
      return 'Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'draft':
      return 'Draft';
    default:
      return status || 'Unknown';
  }
} 