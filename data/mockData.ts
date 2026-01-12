
// --- 1. USER DATA GENERATION ---
export const DEFAULT_USERS = [
    { id: '1', name: 'Sarah Jenkins', role: 'Admin', email: 'sarah.j@omniticket.ai', status: 'Active', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnMLPEAbniWy87T8aMhcMIlTXyKlCvbwdwCAZHCWCFTHet85QBdMVhjZaWKlepGXs9YG8izKsXNN-MyhKfI9ETNa82e6tLq1hZgmW2Di3_EdkuuK5YJdYWWHLBb4O4DwSk_CffS_jJ1ol2iBElsMIfxpz4DiJjsrxhTcu6Yza3AXw8Jz42oJZZTwJ19qkg-MvHkXss2us5TcRaHZ-7xr4BZk9GfnV1HSMWtAhU9eUt70gzW1X67_L-kIP4aRbTaHfro78alJTWASw', badgeColor: 'bg-primary/20 text-primary', allowedTicketTypes: ['IT Support', 'Billing Inquiry', 'Feature Request', 'HR Request', 'Security Incident'] },
    { id: '2', name: 'Michael Chen', role: 'Agent', email: 'm.chen@omniticket.ai', status: 'Active', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAnqjKZB7mza95gkCSBhP348EsL0Y4qQFcTSJLlcL1OyICHgvU0ej4zYo5a-AaKs6FY0RLZBwd7SUPJiFg3IpR-wu_LY009OAGQeYB_UutZ2y9OVrXVH5IV5lC5vzg4RtqSx_ArzWJ9xIGsSLfN0Imn8tG9n1BDQevsDLaZSYbbWVHhMaSSEigudYOFYTZNXl788acInon1FwtmUBKWzyGAGIuRBPHF5JBE2hXBKxl_H5EMD32szzQEg6LIUGAQnoJkLRzn2XdxTA', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['IT Support', 'Billing Inquiry', 'Security Incident'] },
    { id: '3', name: 'Priya Patel', role: 'User', email: 'priya.p@omniticket.ai', status: 'Active', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9x7geSlLWfFyqFgNQsqhrNp-BLxB4wDF5YO-rNA7akFUruEdBq7ON4ppPMQJ3AkZh4cO4DKQbvqfKr-fgLguhvfCxitXnHkJII502XW1jz7HxGmmbMTURptm-r0Bm_nkNPtCd2eHIcNWNVLtrhi3OIpf1NbRQMr9PeWbS3bQx-eF_s-Eiequ9VpVoWaj2RGjlzjNG-JgXjjEB09NFfHptFzCLkZHPPaRQBuKH3lhYtX1GLZYxB_Hru0Yg4JT6S86wfVGx5pzBJqE', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['Feature Request'] },
    { id: '4', name: 'David Kim', role: 'Agent', email: 'd.kim@omniticket.ai', status: 'Active', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNbwd-8Sz65JAxWdw9MnlW2g4aQ2j5AzwuPjrZp-ewd7Q5jjPgCpHoOrIQg_pQdUyRK6mb4mYsQJfUITXXIvAFmy2v8HPw5wwKgmI_d-9d9YVdvXRZkGIBAy3PPJg3O3xT4AdiHDoCTnuzXGpuwx9Avi9oOsDWB_c-fbtz_5JRWEyMdPN0rfihlDA7Mf3tIYS2dFNNKBnjANjvZo78-IjBzdLX2nO9tw-yKXaaEBfEXbqPJOLVuKDej2N36Bn_wLj1jup0e331oZY', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['IT Support', 'Security Incident'] },
    { id: '5', name: 'Emily Stone', role: 'User', email: 'e.stone@omniticket.ai', status: 'Inactive', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq06AC5_pnk0DfJXAbu7EjoPOhYAYUrxktR4UR3oRsHoMU-Gln_rhs64ZXePSppEiiNNpt0eNiCshxukA-VaDXLycwIehFP6AAMO18vravrVTd__2Mj_B6lb8AMir33Mmkrq3KjI0HWay0Skco0Mj3ATHsoW18BltjRoXQ-_ATh7Lg4bI0SGS2XvSEdK2ptDs4j_1jDJZ9jpxk_e5XcogaWfAHv8PasZIqgSp5LI8ulS8Dyf6jUwzIwGoGOlWcgAUcg1Foj0d9Kok', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['IT Support'] },
    { id: '6', name: 'James Wilson', role: 'Manager', email: 'j.wilson@omniticket.ai', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=random', badgeColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300', allowedTicketTypes: ['HR Request', 'Billing Inquiry'] },
    { id: '7', name: 'Linda Martinez', role: 'Agent', email: 'l.martinez@omniticket.ai', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Linda+Martinez&background=random', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['HR Request'] },
    { id: '8', name: 'Robert Fox', role: 'User', email: 'r.fox@omniticket.ai', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Robert+Fox&background=random', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['IT Support', 'Feature Request'] },
    { id: '9', name: 'Patricia Chang', role: 'Agent', email: 'p.chang@omniticket.ai', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Patricia+Chang&background=random', badgeColor: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300', allowedTicketTypes: ['Feature Request', 'Billing Inquiry'] },
    { id: '10', name: 'System Bot', role: 'Agent', email: 'bot@omniticket.ai', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=System+Bot&background=000&color=fff', badgeColor: 'bg-slate-800 text-white', allowedTicketTypes: [] },
    { id: '11', name: 'Amr Mohamed', role: 'Admin', email: 'amohamed@technosignage.com', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Amr+Mohamed&background=0D8ABC&color=fff', badgeColor: 'bg-primary/20 text-primary', allowedTicketTypes: ['IT Support', 'Billing Inquiry', 'Feature Request', 'HR Request', 'Security Incident'] }
];

// --- 2. TICKET TYPES ---
export const DEFAULT_TICKET_TYPES = [
    { 
      id: '1', 
      name: 'IT Support', 
      active: true, 
      fieldCount: 3, 
      icon: 'dns', 
      tags: ['Hardware', 'Priority'], 
      reference: 'ITSP',
      escalationWaitTime: 24,
      fields: [
        { id: 'f1', label: 'Asset ID', type: 'TEXT', required: true, placeholder: 'e.g. LT-2024-001' },
        { id: 'f2', label: 'Issue Category', type: 'DROPDOWN', required: true, options: 'Hardware,Software,Network,Access' },
        { id: 'f3', label: 'Operating System', type: 'TEXT', required: false, placeholder: 'e.g. Windows 11' }
      ]
    },
    { 
      id: '2', 
      name: 'Billing Inquiry', 
      active: true, 
      fieldCount: 2, 
      icon: 'receipt_long', 
      tags: ['Finance'], 
      reference: 'BILL',
      escalationWaitTime: 48,
      fields: [
        { id: 'b1', label: 'Invoice Number', type: 'TEXT', required: true, placeholder: 'INV-...' },
        { id: 'b2', label: 'Dispute Amount', type: 'NUMBER', required: false, placeholder: '0.00' }
      ]
    },
    { 
      id: '3', 
      name: 'Feature Request', 
      active: true, 
      fieldCount: 2, 
      icon: 'lightbulb', 
      tags: ['Product'], 
      reference: 'FEAT',
      escalationWaitTime: 72,
      fields: [
        { id: 'fr1', label: 'Business Value', type: 'RTF', required: true, placeholder: 'Describe the impact...' },
        { id: 'fr2', label: 'Module', type: 'DROPDOWN', required: true, options: 'Dashboard,Reports,Settings,API' }
      ]
    },
    { 
      id: '4', 
      name: 'HR Request', 
      active: true, 
      fieldCount: 2, 
      icon: 'diversity_3', 
      tags: ['Internal'], 
      reference: 'HR',
      escalationWaitTime: 48,
      fields: [
        { id: 'hr1', label: 'Request Type', type: 'DROPDOWN', required: true, options: 'Leave,Benefits,Onboarding,Conflict' },
        { id: 'hr2', label: 'Confidential', type: 'DROPDOWN', required: true, options: 'Yes,No' }
      ]
    },
    { 
      id: '5', 
      name: 'Security Incident', 
      active: true, 
      fieldCount: 3, 
      icon: 'security', 
      tags: ['Critical', 'SecOps'], 
      reference: 'SEC',
      escalationWaitTime: 4,
      fields: [
        { id: 'sec1', label: 'Severity Level', type: 'DROPDOWN', required: true, options: 'Low,Medium,High,Critical' },
        { id: 'sec2', label: 'Affected Systems', type: 'TEXT', required: true, placeholder: 'e.g. Database, Auth Server' },
        { id: 'sec3', label: 'Is Data Compromised?', type: 'DROPDOWN', required: true, options: 'Yes,No,Unknown' }
      ]
    }
];

// --- 3. NOTIFICATIONS ---
export const DEFAULT_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Scheduled Maintenance',
      message: 'The system will be undergoing scheduled maintenance this Saturday from 2:00 AM to 4:00 AM UTC. Services may be intermittent.',
      type: 'info',
      audience: 'All',
      timestamp: Date.now() - 86400000 
    },
    {
      id: 'notif-2',
      title: 'Urgent: Phishing Alert',
      message: 'We have received reports of phishing emails targeting our agents. Please do not click on suspicious links.',
      type: 'alert',
      audience: 'All',
      timestamp: Date.now() - 43200000 
    },
    {
      id: 'notif-3',
      title: 'Q3 Performance Reviews',
      message: 'Q3 performance reviews are due by the end of the week. Please complete your self-assessments.',
      type: 'warning',
      audience: 'Agents',
      timestamp: Date.now() - 172800000 
    }
];

// --- 4. EMAIL TEMPLATES ---
export const DEFAULT_EMAIL_TEMPLATES = [
    {
        id: 'verification',
        name: 'New User Verification (OTP)',
        emailjsId: '',
        variables: ['to_name', 'to_email', 'otp'],
        subject: 'Verify your OmniTicket Account',
        body: 'Hi {{to_name}},\n\nWelcome to OmniTicket! Your verification code is:\n\n{{otp}}\n\nPlease enter this code to activate your account.\n\nBest,\nThe OmniTicket Team'
    },
    {
        id: 'reset_password',
        name: 'Password Reset',
        emailjsId: '',
        variables: ['to_name', 'to_email', 'link'],
        subject: 'Reset your Password',
        body: 'Hi {{to_name}},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n{{link}}\n\nThis link will expire in 1 hour.\n\nRegards,\nOmniTicket Security'
    },
    {
        id: 'ticket_creation',
        name: 'Ticket Created Confirmation',
        emailjsId: '',
        variables: ['to_name', 'ticket_id', 'ticket_title', 'link'],
        subject: 'Ticket #{{ticket_id}} Received',
        body: 'Hello {{to_name}},\n\nYour ticket #{{ticket_id}} - "{{ticket_title}}" has been successfully created. Our support team will review it shortly.\n\nView Ticket: {{link}}\n\nThank you,\nOmniTicket Support'
    },
    {
        id: 'ticket_update',
        name: 'Ticket Status Update',
        emailjsId: '',
        variables: ['to_name', 'ticket_id', 'new_status', 'updated_by'],
        subject: 'Update on Ticket #{{ticket_id}}',
        body: 'Hi {{to_name}},\n\nYour ticket #{{ticket_id}} has been updated.\n\nNew Status: {{new_status}}\nUpdated By: {{updated_by}}\n\nPlease log in to view the full details.\n\nBest,\nOmniTicket Support'
    },
    {
        id: 'ticket_cancellation',
        name: 'Ticket Cancellation',
        emailjsId: '',
        variables: ['to_name', 'ticket_id', 'reason'],
        subject: 'Ticket #{{ticket_id}} Cancelled',
        body: 'Dear {{to_name}},\n\nThis email is to inform you that ticket #{{ticket_id}} has been cancelled.\n\nReason: {{reason}}\n\nIf you believe this is an error, please reply to this email.\n\nRegards,\nOmniTicket Support'
    }
];

// --- 5. TICKET GENERATION LOGIC ---

const ticketTitles: Record<string, string[]> = {
    'IT Support': ['Laptop Screen Flickering', 'Cannot connect to VPN', 'Software Installation Request', 'Mouse not working', 'Keyboard malfunction', 'Slow Internet Speed', 'Printer Jammed', 'Blue Screen of Death', 'Update Failed', 'Monitor Calibration needed'],
    'Billing Inquiry': ['Invoice #4922 Discrepancy', 'Refund Request', 'Payment Failed', 'Upgrade Subscription', 'Downgrade Subscription', 'Clarification on Tax', 'Duplicate Charge', 'Receipt needed', 'Change Payment Method', 'Credit Card Expired'],
    'Feature Request': ['Dark Mode for Mobile', 'Export to CSV', 'API Rate Limit Increase', 'Custom Dashboards', 'SAML SSO Support', 'Bulk Edit Tickets', 'Automated Replies', 'Kanban View', 'Custom Statuses', 'Webhook Integration'],
    'HR Request': ['PTO Request', 'Insurance Policy Question', 'Onboarding New Hire', 'Payroll Issue', 'Work from Home Request', 'Conflict Resolution', 'Training Budget', 'Maternity Leave', 'Address Change', 'Employment Verification'],
    'Security Incident': ['Suspicious Login Attempt', 'Phishing Email Reported', 'Malware Detected', 'Data Leak Suspected', 'Firewall Breach', 'Unusual Network Traffic', 'Lost Company Device', 'Access Control Issue', 'Password Leak', 'DDOS Attack Warning']
};

const priorities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];

const generateTickets = (count: number) => {
    const tickets = [];
    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;

    const agents = DEFAULT_USERS.filter(u => u.role === 'Agent' || u.role === 'Admin');
    const users = DEFAULT_USERS.filter(u => u.role === 'User' || u.role === 'Manager');

    for (let i = 0; i < count; i++) {
        // Random Type
        const typeIndex = Math.floor(Math.random() * DEFAULT_TICKET_TYPES.length);
        const type = DEFAULT_TICKET_TYPES[typeIndex];
        
        // Random Title
        const titles = ticketTitles[type.name];
        const title = titles[Math.floor(Math.random() * titles.length)];

        // Random Priority & Status
        // Weighted random for status (more closed than open usually)
        const statusRand = Math.random();
        let status = 'Open';
        if (statusRand > 0.8) status = 'Open';
        else if (statusRand > 0.6) status = 'In Progress';
        else if (statusRand > 0.5) status = 'Pending';
        else status = 'Closed';

        // Weighted priority (fewer Critical)
        const prioRand = Math.random();
        let priority = 'Low';
        if (prioRand > 0.95) priority = 'Critical';
        else if (prioRand > 0.75) priority = 'High';
        else if (prioRand > 0.4) priority = 'Medium';

        // Random Date within last year
        const timestamp = now - Math.floor(Math.random() * oneYearMs);
        
        // Formatted Time String logic (simplified)
        const dateObj = new Date(timestamp);
        const timeString = dateObj.toLocaleDateString();

        // Assignee
        const assignee = (status === 'Open' && Math.random() > 0.5) ? null : agents[Math.floor(Math.random() * agents.length)];
        
        // Creator
        const creator = users[Math.floor(Math.random() * users.length)];

        // Tags construction
        const tags = [];
        
        // Priority Tag
        if (priority === 'Critical') tags.push({ label: 'Critical', color: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', icon: 'priority_high' });
        else if (priority === 'High') tags.push({ label: 'High', color: 'text-orange-600 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'priority_high' });
        else if (priority === 'Medium') tags.push({ label: 'Medium', color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'remove' });
        else tags.push({ label: 'Low', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700', icon: 'low_priority' });

        // Status Tag
        if (status === 'Open') tags.push({ label: 'Open', color: 'text-green-600 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30', icon: 'radio_button_checked' });
        else if (status === 'In Progress') tags.push({ label: 'In Progress', color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'timelapse' });
        else if (status === 'Pending') tags.push({ label: 'Pending', color: 'text-orange-600 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'hourglass_empty' });
        else tags.push({ label: status, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-800', icon: 'check_circle' });

        // Type Tag
        tags.push({ label: type.name, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700', icon: type.icon });

        tickets.push({
            id: `${type.reference}-${Math.floor(1000 + i)}`,
            title: title,
            time: timeString,
            timestamp: timestamp,
            tags: tags,
            assignee: assignee ? assignee.name : null,
            creator: creator.name,
            avatar: creator.avatar,
            typeId: type.id,
            typeName: type.name,
            description: `Generated simulated ticket for ${type.name}. Issue reported by ${creator.name}.`
        });
    }

    return tickets.sort((a, b) => b.timestamp - a.timestamp);
};

// Generate ~1000 tickets
export const DEFAULT_TICKETS = generateTickets(1024);
