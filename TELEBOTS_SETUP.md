# TeleBots CRUD Setup Guide

This guide explains how to integrate the new TeleBots CRUD page into the admin sidebar.

## Files Created

### 1. telebots.html
Location: `/Users/leocandraseldi/fe-erp/telebots.html`

A complete CRUD interface for managing Telegram Bot users with:
- List view with search functionality
- Create new bot user
- Edit existing bot user
- Delete bot user with confirmation
- Active/Inactive status toggle
- Toast notifications for user feedback

## Integration Steps

### Step 1: Add Navigation Menu Item

You need to add the TeleBots menu item to your navigation configuration. Based on the pattern in your HTML files, the navigation is controlled by `shell.js`.

Find the navigation configuration in `shell.js` (or wherever your menu is defined) and add:

```javascript
{
  key: 'telebots',
  label: 'Telegram Bots',
  icon: '<svg>...</svg>', // Add appropriate icon
  href: 'telebots.html',
  parentKey: 'admin', // Or whatever your admin section key is
  selectedIdx: 1 // Adjust based on position in admin menu
}
```

### Step 2: Update shell.js Navigation

If you have a navigation structure like this:

```javascript
const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Dashboard',
    href: 'dashboard.html',
    icon: '...'
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: '...',
    children: [
      {
        key: 'telebots',
        label: 'Telegram Bots',
        href: 'telebots.html',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>`
      }
      // ... other admin menu items
    ]
  },
  // ... other menu items
];
```

### Step 3: Update API Configuration

Ensure your `api.js` file (or API configuration) includes the base URL. The telebots.html file expects `API_BASE_URL` to be defined. Add this to your api.js:

```javascript
const API_BASE_URL = 'YOUR_BACKEND_URL'; // e.g., 'http://localhost:3000'
```

Or if you're using environment variables, make sure it's accessible:

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### Step 4: Create Required JavaScript Files (if missing)

If `shell.js`, `api.js`, or `auth.js` don't exist yet, you'll need to create them:

#### shell.js (Navigation Handler)
```javascript
// Basic shell.js structure
document.addEventListener('DOMContentLoaded', function() {
  // Render navigation based on ACTIVE_KEY and SELECTED_IDX
  renderNav();
  handleCollapseToggle();
  updateBreadcrumb();
});

function renderNav() {
  const navEl = document.getElementById('nav');
  const activeKey = window.ACTIVE_KEY || 'home';

  // Build navigation HTML based on your menu structure
  // This will populate the <nav id="nav"></nav> element
}
```

#### api.js (API Helper)
```javascript
const API_BASE_URL = 'http://localhost:3000'; // Update with your backend URL

// Add any API helper functions if needed
```

#### auth.js (Authentication)
```javascript
// Handle authentication checks
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  if (!token && !window.location.pathname.includes('index.html')) {
    window.location.href = 'index.html';
  }
});
```

### Step 5: Update shell.css (if needed)

Make sure your `shell.css` includes all necessary CSS custom properties:
```css
:root {
  --grad: linear-gradient(135deg, #1ca7ec 0%, #121567 100%);
  --blue: #1ca7ec;
  --dark: #121567;
  --text: #2c3e50;
  --muted: #6c757d;
  --border: #dee2e6;
  --bg: #f5f7fa;
  --card: #ffffff;
  --red: #fe2c23;
}
```

## API Endpoints Required

The telebots.html page makes the following API calls:

### GET /api/telebots
Fetch all telegram bot users
```json
Response: {
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "id": "string",
      "employee_number": "string",
      "name": "string",
      "telegram_id": 123456789,
      "telegram_username": "string",
      "role": "string",
      "active": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/telebots
Create new telegram bot user
```json
Request Body: {
  "employee_number": "string",
  "name": "string",
  "telegram_id": 123456789,
  "telegram_username": "string",
  "role": "string",
  "active": true
}

Response: {
  "status": "success",
  "statusCode": 201,
  "message": "Telegram bot user created successfully",
  "data": { /* TeleBot object */ }
}
```

### PUT /api/telebots/:id
Update existing telegram bot user
```json
Request Body: {
  "employee_number": "string",
  "name": "string",
  "telegram_id": 123456789,
  "telegram_username": "string",
  "role": "string",
  "active": true
}

Response: {
  "status": "success",
  "statusCode": 200,
  "message": "Telegram bot user updated successfully",
  "data": { /* TeleBot object */ }
}
```

### DELETE /api/telebots/:id
Delete telegram bot user
```json
Response: {
  "status": "success",
  "statusCode": 200,
  "message": "Telegram bot user deleted successfully"
}
```

## Features

1. **Search**: Real-time search by name, employee number, or telegram username
2. **Create**: Add new telegram bot users with validation
3. **Edit**: Update existing bot user information
4. **Delete**: Remove bot users with confirmation dialog
5. **Status Management**: Toggle active/inactive status
6. **Responsive**: Works on desktop and mobile devices
7. **Toast Notifications**: User-friendly feedback messages

## Customization

### Change Active Key
In `telebots.html`, update line with `window.ACTIVE_KEY`:
```javascript
window.ACTIVE_KEY = 'admin'; // Your admin section key
window.SELECTED_IDX = 1; // Position in admin submenu
```

### Modify Roles
Update the role dropdown options in the HTML:
```html
<select class="selectbox" id="role" required>
  <option value="">Select role...</option>
  <option value="admin">Admin</option>
  <option value="user">User</option>
  <option value="collector">Collector</option>
  <option value="salesperson">Salesperson</option>
  <!-- Add more roles as needed -->
</select>
```

### Customize Colors
The page uses CSS custom properties defined in `shell.css`. You can override them in the page's `<style>` section.

## Testing

1. Open the page directly: `http://localhost/telebots.html`
2. Verify the API endpoints are working
3. Test all CRUD operations:
   - Create a new bot user
   - Edit the created user
   - Search for users
   - Delete the user
4. Check responsive design on mobile

## Troubleshooting

### Navigation not showing
- Verify `shell.js` is properly loaded
- Check `window.ACTIVE_KEY` is set correctly
- Ensure navigation config includes telebots entry

### API calls failing
- Verify `API_BASE_URL` is set correctly
- Check CORS settings on backend
- Verify authentication token is present

### Styling issues
- Ensure `shell.css` is loaded
- Check browser console for CSS errors
- Verify all CSS custom properties are defined

## Next Steps

1. Create or update `shell.js` with navigation configuration
2. Update backend API to implement the TeleBots endpoints
3. Test the integration end-to-end
4. Add any additional fields or features as needed
