# FloatingAdminChat Component

The FloatingAdminChat component provides a floating chat button in the bottom-right corner of the seller dashboard that allows sellers to communicate with admin support.

## Key Features

1. **Admin Communication**: Messages sent by sellers are delivered to all admin users
2. **Real-time Messaging**: Uses Socket.IO for instant message delivery
3. **Notification System**: Notifies admins when new messages arrive
4. **Unread Message Counter**: Shows the number of unread messages
5. **Mobile-Friendly Design**: Responsive interface works on all devices

## How It Works

### Message Delivery to All Admins

When a seller sends a message using the chat:

1. The message is sent with `reciver: 'admin'` which is a special identifier
2. On the backend, the `MessageService.create()` method:
   - Creates the message in the database
   - Checks if the receiver is 'admin'
   - Retrieves all users with ADMIN role using `userService.findUsersByRoles([RoleCode.ADMIN])`
   - Creates a notification for each admin
   - Sends real-time notifications to all online admins via sockets

### Socket Communication

The component uses socket events for real-time communication:
- Listens for the 'sendMessage' event to receive new messages
- Updates the unread counter when new messages arrive while the chat is closed

### Admin Response

When admins reply from the backoffice dashboard:
1. The ChatLayout component in the backoffice sends messages with proper sender/receiver identifiers
2. Sellers receive notifications and the messages appear in their chat window

## Usage

The FloatingAdminChat component is included in the main App component and doesn't require any props. It automatically initializes and handles all communication with the backend.

## Technical Implementation

- **API Communication**: Uses ChatAPI and MessageAPI for CRUD operations
- **State Management**: Uses React hooks to manage component state
- **Responsive Design**: CSS provides a seamless experience on all devices
- **Notification Handling**: Integrates with the notification system to alert users of new messages 