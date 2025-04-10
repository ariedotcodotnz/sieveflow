import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {
    X, Plus, Code, Trash2, ArrowDown, ArrowUp, CheckSquare, Square,
    Copy, HelpCircle, AlertCircle, Info, ChevronDown, ChevronRight, FileText,
    AlertTriangle, CopyCheck, Download, RefreshCw, Upload, Clipboard, Save,
    CheckCircle, Edit, PlayCircle, StopCircle, PlusSquare, RotateCcw
} from 'lucide-react';

// Import additional required hooks if needed
// Ensure we have access to all the necessary React features

// Helper to create a unique ID
const createId = () => `id_${Math.random().toString(36).substring(2, 11)}`;

// Example script templates
const SCRIPT_TEMPLATES = {
    empty: {name: "Empty Script", rules: []},
    basic: {
        name: "Basic Filtering",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [{
                    type: 'header',
                    comparator: 'i;ascii-casemap',
                    matchType: ':is',
                    header: 'Subject',
                    keys: ['[SPAM]']
                }],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Spam'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    vacation: {
        name: "Vacation Reply",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [{type: 'true'}],
                actions: [{
                    type: 'vacation',
                    parameters: {
                        days: 7,
                        subject: "Out of Office",
                        message: "I'm currently away and will reply to your email when I return."
                    }
                }],
                combinator: 'anyof'
            }
        ],
        extensions: {vacation: true}
    },
    spam: {
        name: "Spam Filter",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        header: 'Subject',
                        keys: ['viagra', 'cialis', 'enlargement']
                    },
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        header: 'From',
                        keys: ['pharmacy', 'discount']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Spam'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    newsletter: {
        name: "Newsletter Filter",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        header: 'Subject',
                        keys: ['newsletter', 'weekly update', 'digest']
                    },
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        header: 'From',
                        keys: ['news@', 'newsletter@', 'noreply@', 'do-not-reply@']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Newsletters'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    importantContacts: {
        name: "Important Contacts",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'address',
                        comparator: 'i;ascii-casemap',
                        matchType: ':is',
                        addressPart: ':all',
                        header: 'From',
                        keys: ['boss@company.com', 'important@client.com']
                    }
                ],
                actions: [
                    {type: 'fileinto', parameters: {mailbox: 'INBOX.Important'}},
                    {type: 'addheader', parameters: {name: 'X-Priority', value: 'High', last: false}}
                ],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true, editheader: true}
    },
    attachmentHandler: {
        name: "Attachment Handler",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':matches',
                        header: 'Content-Type',
                        keys: ['*multipart/mixed*']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Attachments'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    notificationFilter: {
        name: "Notification Filter",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        header: 'Subject',
                        keys: ['notification', 'alert', 'confirm', 'verify']
                    },
                    {
                        type: 'address',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        addressPart: ':domain',
                        header: 'From',
                        keys: ['no-reply', 'noreply', 'donotreply']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Notifications'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    workPersonalSeparator: {
        name: "Work/Personal Separator",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'address',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        addressPart: ':domain',
                        header: 'From',
                        keys: ['company.com', 'work.org']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Work'}}],
                combinator: 'anyof'
            },
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'address',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        addressPart: ':domain',
                        header: 'From',
                        keys: ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Personal'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    socialMediaFilter: {
        name: "Social Media Filter",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'address',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        addressPart: ':domain',
                        header: 'From',
                        keys: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'pinterest.com']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Social'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    mailingListHandler: {
        name: "Mailing List Handler",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {type: 'exists', header: ['List-Id', 'List-Unsubscribe', 'List-Subscribe']}
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.MailingLists'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true}
    },
    forwardSpecific: {
        name: "Forward from Specific Domains",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'address',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        addressPart: ':domain',
                        header: 'From',
                        keys: ['important-client.com', 'partner.org']
                    }
                ],
                actions: [
                    {type: 'redirect', parameters: {address: 'myotheremail@example.com', copy: true}}
                ],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true, copy: true}
    },
    autoArchive: {
        name: "Auto Archive Old Messages",
        rules: [
            {
                id: createId(),
                active: true,
                conditions: [
                    {
                        type: 'header',
                        comparator: 'i;ascii-casemap',
                        matchType: ':contains',
                        header: 'Subject',
                        keys: ['report', 'newsletter', 'update']
                    }
                ],
                actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Archive'}}],
                combinator: 'anyof'
            }
        ],
        extensions: {fileinto: true, date: true}
    }
};

// Extension categories for better organization
const EXTENSION_CATEGORIES = {
    core: ['fileinto', 'envelope'],
    actions: ['reject', 'vacation', 'copy', 'fcc', 'enotify'],
    tests: ['body', 'date', 'index', 'relational', 'subaddress'],
    message: ['editheader', 'imap4flags', 'mime', 'convert'],
    advanced: ['variables', 'include', 'environment', 'comparator']
};

// Extension descriptions for tooltips
const EXTENSION_DESCRIPTIONS = {
    fileinto: "Adds the fileinto action for delivering to specific mailboxes",
    reject: "Adds the reject action to refuse a message with a reason",
    vacation: "Adds the vacation action for auto-replies",
    envelope: "Adds the envelope test for accessing SMTP envelope information",
    variables: "Adds variables for storing and reusing values",
    body: "Adds the body test for checking message body content",
    relational: "Adds relational comparison operators like greater than/less than",
    comparator: "Adds support for different string comparison methods",
    subaddress: "Adds address parts for handling plus addressing (user+detail@domain)",
    copy: "Adds :copy argument to fileinto/redirect to avoid implicit keep cancellation",
    imap4flags: "Adds actions to manipulate IMAP flags",
    date: "Adds date and time test capabilities",
    index: "Adds index argument to limit tests to specific header instances",
    editheader: "Adds actions to add or remove headers",
    enotify: "Adds actions to send notifications",
    environment: "Adds tests for environment items like current host/domain",
    mime: "Adds MIME-specific tests and transformations",
    convert: "Adds the ability to convert between MIME types",
    include: "Adds the ability to include other Sieve scripts",
    fcc: "Adds file carbon copy support to save copies of messages"
};

// Help text for different components
const HELP_TEXT = {
    // General help
    rule: "A rule defines what to look for in emails (conditions) and what to do when matched (actions)",
    anyof: "If ANY of the conditions match, the rule will be applied",
    allof: "ALL conditions must match for the rule to be applied",

    // Condition types
    conditionTypes: {
        header: "Checks if a header (like Subject, From, To) contains, matches, or equals specific text",
        address: "Tests parts of email addresses (username, domain, or complete address)",
        envelope: "Tests the message envelope (the SMTP sender/recipient, not what's in the From/To headers)",
        size: "Checks if the message size is over or under a specified limit",
        body: "Examines the message body for specific content",
        exists: "Checks if a header exists in the message",
        true: "Always matches (useful for creating default rules)",
        false: "Never matches (useful for testing)"
    },

    // Match types
    matchTypes: {
        is: "Exact match - the entire content must be identical",
        contains: "Partial match - the content must contain this text",
        matches: "Pattern match using wildcards (* for any characters, ? for any single character)"
    },

    // Action types
    actionTypes: {
        keep: "Keep the message in the inbox (this is the default if no other action is specified)",
        fileinto: "Move the message to a specific mailbox/folder",
        redirect: "Forward the message to another email address",
        discard: "Silently delete the message without notification",
        reject: "Reject the message with an explanation returned to the sender",
        addheader: "Add a new header to the message",
        deleteheader: "Remove a header from the message",
        stop: "Stop processing this message with other rules",
        vacation: "Send an automatic reply to the sender"
    },

    // Address parts
    addressParts: {
        all: "The entire email address (e.g., user@example.com)",
        localpart: "Just the username part (e.g., 'user' from user@example.com)",
        domain: "Just the domain part (e.g., 'example.com' from user@example.com)"
    },

    // Body transforms
    bodyTransforms: {
        text: "Looks at the text representation of the message body",
        raw: "Examines the raw message body content",
        content: "Examines specific content types within the message"
    },

    // File options
    fileOptions: {
        copy: "Keep a copy in the inbox in addition to filing in the specified folder",
        create: "Create the destination mailbox if it doesn't exist"
    },

    // Vacation options
    vacationOptions: {
        days: "Minimum number of days between auto-replies to the same sender",
        subject: "Subject line for the auto-reply message",
        message: "Body text of the auto-reply message"
    }
};

// Enhanced Sieve parser for importing scripts
const parseSieveScript = (script) => {
    try {
        const result = {
            rules: [],
            extensions: {}
        };

        // Extract require statements
        const requireRegex = /require\s+\[(.*?)\]/g;
        const requireMatches = [...script.matchAll(requireRegex)];

        if (requireMatches.length > 0) {
            const extensionList = requireMatches[0][1];
            const extensions = extensionList.match(/"([^"]+)"/g) || [];

            extensions.forEach(ext => {
                const cleanExt = ext.replace(/"/g, '');
                result.extensions[cleanExt] = true;
            });
        }

        // Extract if/elsif blocks as rules (improved implementation)
        const ruleRegex = /(if|elsif)\s+(.*?)\s*\{([\s\S]*?)\}/g;
        const ruleMatches = [...script.matchAll(ruleRegex)];

        ruleMatches.forEach(match => {
            const conditions = match[2].trim();
            const actions = match[3].trim();

            // Create a basic rule structure
            const rule = {
                id: createId(),
                active: true,
                conditions: [],
                actions: [],
                combinator: conditions.startsWith('anyof') ? 'anyof' : 'allof'
            };

            // Parse conditions
            if (conditions.includes('header')) {
                // Parse header tests
                const headerRegex = /header\s+(:is|:contains|:matches)\s+(?::comparator\s+"([^"]+)")?\s*"([^"]+)"\s+"([^"]+)"/g;
                const headerMatches = [...conditions.matchAll(headerRegex)];

                headerMatches.forEach(headerMatch => {
                    rule.conditions.push({
                        type: 'header',
                        comparator: headerMatch[2] || 'i;ascii-casemap',
                        matchType: headerMatch[1],
                        header: headerMatch[3],
                        keys: [headerMatch[4]]
                    });
                });
            } else if (conditions.includes('address')) {
                // Parse address tests
                const addressRegex = /address\s+(:is|:contains|:matches)\s+(:all|:localpart|:domain)\s+(?::comparator\s+"([^"]+)")?\s*"([^"]+)"\s+"([^"]+)"/g;
                const addressMatches = [...conditions.matchAll(addressRegex)];

                addressMatches.forEach(addressMatch => {
                    rule.conditions.push({
                        type: 'address',
                        comparator: addressMatch[3] || 'i;ascii-casemap',
                        matchType: addressMatch[1],
                        addressPart: addressMatch[2],
                        header: addressMatch[4],
                        keys: [addressMatch[5]]
                    });
                });
            } else if (conditions.includes('true')) {
                rule.conditions.push({type: 'true'});
            } else if (conditions.includes('false')) {
                rule.conditions.push({type: 'false'});
            } else if (conditions.includes('exists')) {
                // Parse exists tests
                const existsRegex = /exists\s+"([^"]+)"/g;
                const existsMatches = [...conditions.matchAll(existsRegex)];

                if (existsMatches.length > 0) {
                    rule.conditions.push({
                        type: 'exists',
                        header: existsMatches.map(m => m[1])
                    });
                }
            }

            // Parse actions
            if (actions.includes('fileinto')) {
                const mailboxMatch = actions.match(/fileinto\s+(?::create\s+)?(?::copy\s+)?"([^"]+)"/);
                const copyMatch = actions.match(/fileinto\s+:copy/);
                const createMatch = actions.match(/fileinto\s+:create/);

                rule.actions.push({
                    type: 'fileinto',
                    parameters: {
                        mailbox: mailboxMatch ? mailboxMatch[1] : 'INBOX',
                        copy: copyMatch ? true : false,
                        create: createMatch ? true : false
                    }
                });
            }

            if (actions.includes('redirect')) {
                const addressMatch = actions.match(/redirect\s+(?::copy\s+)?"([^"]+)"/);
                const copyMatch = actions.match(/redirect\s+:copy/);

                rule.actions.push({
                    type: 'redirect',
                    parameters: {
                        address: addressMatch ? addressMatch[1] : '',
                        copy: copyMatch ? true : false
                    }
                });
            }

            if (actions.includes('keep')) {
                rule.actions.push({type: 'keep'});
            }

            if (actions.includes('discard')) {
                rule.actions.push({type: 'discard'});
            }

            if (actions.includes('stop')) {
                rule.actions.push({type: 'stop'});
            }

            if (actions.includes('vacation')) {
                const messageMatch = actions.match(/vacation\s+(?::days\s+(\d+))?\s+(?::subject\s+"([^"]+)")?\s+"([^"]+)"/);

                if (messageMatch) {
                    rule.actions.push({
                        type: 'vacation',
                        parameters: {
                            days: messageMatch[1] ? parseInt(messageMatch[1]) : 7,
                            subject: messageMatch[2] || 'Out of Office',
                            message: messageMatch[3] || ''
                        }
                    });
                }
            }

            if (actions.includes('reject')) {
                const reasonMatch = actions.match(/reject\s+"([^"]+)"/);

                rule.actions.push({
                    type: 'reject',
                    parameters: {
                        reason: reasonMatch ? reasonMatch[1] : ''
                    }
                });
            }

            result.rules.push(rule);
        });

        return result;
    } catch (e) {
        console.error("Error parsing Sieve script:", e);
        return null;
    }
};

// Tooltip component for help text
const HelpTooltip = ({text, children, position = "top"}) => {
    const positionClasses = {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
    };

    return (
        <div className="relative inline-flex items-center group">
            {children}
            <div
                className={`absolute ${positionClasses[position]} w-64 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50`}>
                {text}
            </div>
        </div>
    );
};

// Define the main editor component
const SieveEditor = () => {
    // State for rules
    const [rules, setRules] = useState([]);
    // State for extensions
    const [extensions, setExtensions] = useState({
        fileinto: true,
        reject: false,
        vacation: false,
        envelope: false,
        variables: false,
        body: false,
        relational: false,
        comparator: false,
        subaddress: false,
        copy: false,
        imap4flags: false,
        date: false,
        index: false,
        editheader: false,
        enotify: false,
        environment: false,
        mime: false,
        convert: false,
        include: false,
        fcc: false
    });
    // State for generated code
    const [generatedCode, setGeneratedCode] = useState('');
    // State for code view toggle
    const [showCode, setShowCode] = useState(false);
    // State for validation warnings
    const [validationWarnings, setValidationWarnings] = useState([]);
    // State for copied notification
    const [copied, setCopied] = useState(false);
    // State for showing templates modal
    const [showTemplates, setShowTemplates] = useState(false);
    // State for expanded categories
    const [expandedCategories, setExpandedCategories] = useState({
        core: true,
        actions: false,
        tests: false,
        message: false,
        advanced: false
    });
    // State for showing help
    const [showHelp, setShowHelp] = useState(false);
    // State for notifications
    const [notification, setNotification] = useState(null);
    // State for code editing mode
    const [codeEditMode, setCodeEditMode] = useState(false);
    // State for edited code
    const [editedCode, setEditedCode] = useState('');

    // Ref for download link
    const downloadLinkRef = useRef(null);
    // Ref for import file input
    const importFileRef = useRef(null);
    // Ref for code editor
    const codeEditorRef = useRef(null);

    // Update generated code whenever rules or extensions change
    useEffect(() => {
        if (!codeEditMode) {
            generateCode();
        }
    }, [rules, extensions, codeEditMode]);

    // Initial setup - check for saved script in localStorage
    useEffect(() => {
        const savedScript = localStorage.getItem('sieve-script');
        if (savedScript) {
            try {
                const {rules: savedRules, extensions: savedExtensions} = JSON.parse(savedScript);
                if (savedRules && Array.isArray(savedRules) && savedRules.length > 0) {
                    setRules(savedRules);
                } else {
                    // Start with a basic rule if no saved script
                    addRule();
                }
                if (savedExtensions && typeof savedExtensions === 'object') {
                    setExtensions(savedExtensions);
                }
            } catch (e) {
                console.error("Error loading saved script:", e);
                // Start with a basic rule if loading fails
                addRule();
                showNotification("Error loading saved script. Starting with a new script.", "error");
            }
        } else {
            // Start with a basic rule if no saved script
            addRule();
        }
    }, []);

    // Save script to localStorage whenever it changes
    useEffect(() => {
        if (rules.length > 0) {
            localStorage.setItem('sieve-script', JSON.stringify({
                rules,
                extensions
            }));
        }
    }, [rules, extensions]);

    // Validate script and show warnings
    useEffect(() => {
        validateScript();
    }, [rules, extensions]);

    // Show a notification message
    const showNotification = useCallback((message, type = "info") => {
        setNotification({message, type});
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Add a new rule
    const addRule = useCallback(() => {
        setRules(prevRules => [...prevRules, {
            id: createId(),
            active: true,
            conditions: [{
                type: 'header',
                comparator: 'i;ascii-casemap',
                matchType: ':is',
                header: 'Subject',
                keys: ['']
            }],
            actions: [{type: 'fileinto', parameters: {mailbox: 'INBOX.Filtered'}}],
            combinator: 'anyof'
        }]);
    }, []);

    // Duplicate an existing rule
    const duplicateRule = useCallback((ruleId) => {
        setRules(prevRules => {
            const ruleToDuplicate = prevRules.find(rule => rule.id === ruleId);
            if (!ruleToDuplicate) return prevRules;

            // Create a deep copy of the rule with a new ID
            const duplicatedRule = {
                ...JSON.parse(JSON.stringify(ruleToDuplicate)),
                id: createId()
            };

            // Find the index of the original rule
            const index = prevRules.findIndex(rule => rule.id === ruleId);

            // Insert the duplicated rule after the original
            const newRules = [...prevRules];
            newRules.splice(index + 1, 0, duplicatedRule);

            showNotification("Rule duplicated", "success");
            return newRules;
        });
    }, [showNotification]);

    // Load a template
    const loadTemplate = useCallback((templateKey) => {
        const template = SCRIPT_TEMPLATES[templateKey];
        if (template) {
            if (rules.length > 0) {
                if (!window.confirm("This will replace your current script. Continue?")) {
                    return;
                }
            }

            // Create a deep copy of the template rules to ensure they have unique IDs
            const newRules = template.rules.map(rule => ({
                ...rule,
                id: createId(), // Ensure each rule has a new unique ID
                // Deep copy conditions and actions
                conditions: rule.conditions.map(condition => ({...condition})),
                actions: rule.actions.map(action => ({...action}))
            }));

            setRules(newRules);

            if (template.extensions) {
                setExtensions(prev => ({
                    ...prev,
                    ...template.extensions
                }));
            }

            setShowTemplates(false);
            showNotification(`Loaded "${template.name}" template`, "success");
        }
    }, [rules, showNotification]);

    // Toggle a category's expanded state
    const toggleCategory = useCallback((category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    }, []);

    // Validate the script
    const validateScript = useCallback(() => {
        const warnings = [];

        // Check if any rule is active
        if (rules.length > 0 && !rules.some(rule => rule.active)) {
            warnings.push("No active rules - script will have no effect");
        }

        // Check for empty conditions or actions
        rules.forEach((rule, index) => {
            if (rule.active) {
                if (rule.conditions.length === 0) {
                    warnings.push(`Rule ${index + 1} has no conditions`);
                } else {
                    // Check for incomplete conditions
                    rule.conditions.forEach((condition, condIndex) => {
                        if (condition.type === 'header' && (!condition.header || condition.header.trim() === '')) {
                            warnings.push(`Rule ${index + 1}, condition ${condIndex + 1} has an empty header name`);
                        }
                        if ((condition.type === 'header' || condition.type === 'address') &&
                            Array.isArray(condition.keys) &&
                            (condition.keys.length === 0 || condition.keys[0] === '')) {
                            warnings.push(`Rule ${index + 1}, condition ${condIndex + 1} has an empty value`);
                        }
                    });
                }

                if (rule.actions.length === 0) {
                    warnings.push(`Rule ${index + 1} has no actions`);
                } else {
                    // Check for incomplete actions
                    rule.actions.forEach((action, actionIndex) => {
                        if (action.type === 'fileinto' && (!action.parameters?.mailbox || action.parameters.mailbox.trim() === '')) {
                            warnings.push(`Rule ${index + 1}, action ${actionIndex + 1} has an empty mailbox name`);
                        }
                        if (action.type === 'redirect' && (!action.parameters?.address || action.parameters.address.trim() === '')) {
                            warnings.push(`Rule ${index + 1}, action ${actionIndex + 1} has an empty redirect address`);
                        }
                    });
                }
            }
        });

        // Check for required extensions
        const usedActions = new Set();
        const usedTests = new Set();

        rules.forEach(rule => {
            if (rule.active) {
                rule.actions.forEach(action => usedActions.add(action.type));
                rule.conditions.forEach(condition => usedTests.add(condition.type));
            }
        });

        if (usedActions.has('fileinto') && !extensions.fileinto) {
            warnings.push("Script uses 'fileinto' action but 'fileinto' extension is not enabled");
        }

        if (usedActions.has('reject') && !extensions.reject) {
            warnings.push("Script uses 'reject' action but 'reject' extension is not enabled");
        }

        if (usedActions.has('vacation') && !extensions.vacation) {
            warnings.push("Script uses 'vacation' action but 'vacation' extension is not enabled");
        }

        if (usedTests.has('envelope') && !extensions.envelope) {
            warnings.push("Script uses 'envelope' test but 'envelope' extension is not enabled");
        }

        if (usedTests.has('body') && !extensions.body) {
            warnings.push("Script uses 'body' test but 'body' extension is not enabled");
        }

        setValidationWarnings(warnings);
    }, [rules, extensions]);

    // Remove a rule
    const removeRule = useCallback((id) => {
        setRules(prevRules => prevRules.filter(rule => rule.id !== id));
        showNotification("Rule removed", "info");
    }, [showNotification]);

    // Toggle rule activation
    const toggleRuleActive = useCallback((id) => {
        setRules(prevRules => prevRules.map(rule =>
            rule.id === id ? {...rule, active: !rule.active} : rule
        ));
    }, []);

    // Add a condition to a rule
    const addCondition = useCallback((ruleId) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                return {
                    ...rule,
                    conditions: [
                        ...rule.conditions,
                        {type: 'header', comparator: 'i;ascii-casemap', matchType: ':is', header: 'Subject', keys: ['']}
                    ]
                };
            }
            return rule;
        }));
    }, []);

    // Remove a condition from a rule
    const removeCondition = useCallback((ruleId, index) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                const newConditions = [...rule.conditions];
                newConditions.splice(index, 1);
                return {
                    ...rule,
                    conditions: newConditions
                };
            }
            return rule;
        }));
    }, []);

    // Add an action to a rule
    const addAction = useCallback((ruleId) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                return {
                    ...rule,
                    actions: [
                        ...rule.actions,
                        {type: 'fileinto', parameters: {mailbox: 'INBOX.Filtered'}}
                    ]
                };
            }
            return rule;
        }));
    }, []);

    // Remove an action from a rule
    const removeAction = useCallback((ruleId, index) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                const newActions = [...rule.actions];
                newActions.splice(index, 1);
                return {
                    ...rule,
                    actions: newActions
                };
            }
            return rule;
        }));
    }, []);

    // Update a condition
    const updateCondition = useCallback((ruleId, index, updates) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                const newConditions = [...rule.conditions];
                newConditions[index] = {...newConditions[index], ...updates};
                return {
                    ...rule,
                    conditions: newConditions
                };
            }
            return rule;
        }));
    }, []);

    // Update an action
    const updateAction = useCallback((ruleId, index, updates) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                const newActions = [...rule.actions];
                newActions[index] = {...newActions[index], ...updates};
                return {
                    ...rule,
                    actions: newActions
                };
            }
            return rule;
        }));
    }, []);

    // Move a rule up
    const moveRuleUp = useCallback((index) => {
        if (index === 0) return;
        setRules(prevRules => {
            const newRules = [...prevRules];
            const temp = newRules[index];
            newRules[index] = newRules[index - 1];
            newRules[index - 1] = temp;
            return newRules;
        });
    }, []);

    // Move a rule down
    const moveRuleDown = useCallback((index) => {
        setRules(prevRules => {
            if (index === prevRules.length - 1) return prevRules;
            const newRules = [...prevRules];
            const temp = newRules[index];
            newRules[index] = newRules[index + 1];
            newRules[index + 1] = temp;
            return newRules;
        });
    }, []);

    // Toggle combinator between anyof and allof
    const toggleCombinator = useCallback((ruleId) => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === ruleId) {
                return {
                    ...rule,
                    combinator: rule.combinator === 'anyof' ? 'allof' : 'anyof'
                };
            }
            return rule;
        }));
    }, []);

    // Toggle extension
    const toggleExtension = useCallback((ext) => {
        setExtensions(prevExtensions => ({
            ...prevExtensions,
            [ext]: !prevExtensions[ext]
        }));
    }, []);

    // Function to generate Sieve code from the rules
    const generateCode = useCallback(() => {
        let code = '';

        // Add require section first
        const requiredExtensions = [];
        if (extensions.fileinto) requiredExtensions.push('fileinto');
        if (extensions.reject) requiredExtensions.push('reject');
        if (extensions.vacation) requiredExtensions.push('vacation');
        if (extensions.envelope) requiredExtensions.push('envelope');
        if (extensions.variables) requiredExtensions.push('variables');
        if (extensions.body) requiredExtensions.push('body');
        if (extensions.relational) requiredExtensions.push('relational');
        if (extensions.comparator && requiredExtensions.indexOf('comparator-i;ascii-casemap') === -1)
            requiredExtensions.push('comparator-i;ascii-casemap');
        if (extensions.subaddress) requiredExtensions.push('subaddress');
        if (extensions.copy) requiredExtensions.push('copy');
        if (extensions.imap4flags) requiredExtensions.push('imap4flags');
        if (extensions.date) requiredExtensions.push('date');
        if (extensions.index) requiredExtensions.push('index');
        if (extensions.editheader) requiredExtensions.push('editheader');
        if (extensions.enotify) requiredExtensions.push('enotify');
        if (extensions.environment) requiredExtensions.push('environment');
        if (extensions.mime) requiredExtensions.push('mime');
        if (extensions.convert) requiredExtensions.push('convert');
        if (extensions.include) requiredExtensions.push('include');
        if (extensions.fcc) requiredExtensions.push('fcc');

        if (requiredExtensions.length > 0) {
            code += `require [${requiredExtensions.map(ext => `"${ext}"`).join(', ')}];\n\n`;
        }

        // Filter rules that are active
        const activeRules = rules.filter(rule => rule.active);

        if (activeRules.length === 0) {
            setGeneratedCode(code);
            return;
        }

        if (activeRules.length === 1) {
            // Single rule - use if directly
            const rule = activeRules[0];
            code += generateRuleCode(rule);
        } else {
            // Multiple rules - use if/elsif structure
            activeRules.forEach((rule, index) => {
                if (index === 0) {
                    code += `if ${generateConditionCode(rule)}\n{\n`;
                } else {
                    code += `elsif ${generateConditionCode(rule)}\n{\n`;
                }

                rule.actions.forEach(action => {
                    code += `    ${generateActionCode(action)};\n`;
                });

                code += `}\n`;
            });
        }

        setGeneratedCode(code);
        if (codeEditMode) {
            setEditedCode(code);
        }
    }, [rules, extensions, codeEditMode]);

    // Helper to generate a single rule's code
    const generateRuleCode = useCallback((rule) => {
        let code = '';

        code += `if ${generateConditionCode(rule)}\n{\n`;

        rule.actions.forEach(action => {
            code += `    ${generateActionCode(action)};\n`;
        });

        code += `}\n`;

        return code;
    }, []);

    // Helper to generate condition code for a rule
    const generateConditionCode = useCallback((rule) => {
        if (rule.conditions.length === 0) {
            return 'true';
        }

        if (rule.conditions.length === 1) {
            return generateSingleConditionCode(rule.conditions[0]);
        }

        // Multiple conditions using the combinator
        return `${rule.combinator} (${
            rule.conditions.map(condition => generateSingleConditionCode(condition)).join(', ')
        })`;
    }, []);

    // Helper to generate a single condition code
    const generateSingleConditionCode = useCallback((condition) => {
        switch (condition.type) {
            case 'header':
                return `header ${condition.matchType} ${condition.comparator !== 'i;ascii-casemap' ? `:comparator "${condition.comparator}" ` : ''}${JSON.stringify(condition.header)} ${JSON.stringify(condition.keys)}`;

            case 'address':
                return `address ${condition.matchType} ${condition.addressPart || ':all'} ${condition.comparator !== 'i;ascii-casemap' ? `:comparator "${condition.comparator}" ` : ''}${JSON.stringify(condition.header)} ${JSON.stringify(condition.keys)}`;

            case 'envelope':
                return `envelope ${condition.matchType} ${condition.addressPart || ':all'} ${condition.comparator !== 'i;ascii-casemap' ? `:comparator "${condition.comparator}" ` : ''}${JSON.stringify(condition.part)} ${JSON.stringify(condition.keys)}`;

            case 'size':
                return `size ${condition.operator} ${condition.size}`;

            case 'body':
                return `body ${condition.matchType} ${condition.transform ? `${condition.transform} ` : ''}${condition.comparator !== 'i;ascii-casemap' ? `:comparator "${condition.comparator}" ` : ''}${JSON.stringify(condition.keys)}`;

            case 'exists':
                return `exists ${JSON.stringify(condition.header)}`;

            case 'true':
                return 'true';

            case 'false':
                return 'false';

            default:
                return 'true';
        }
    }, []);

    // Helper to generate action code
    const generateActionCode = useCallback((action) => {
        switch (action.type) {
            case 'keep':
                return 'keep';

            case 'fileinto':
                const fiOptions = [];
                if (action.parameters?.create) fiOptions.push(':create');
                if (action.parameters?.flags && action.parameters.flags.length > 0)
                    fiOptions.push(`:flags ${JSON.stringify(action.parameters.flags)}`);
                if (action.parameters?.copy) fiOptions.push(':copy');

                return `fileinto ${fiOptions.join(' ')} ${JSON.stringify(action.parameters?.mailbox || 'INBOX')}`;

            case 'redirect':
                const redOptions = [];
                if (action.parameters?.copy) redOptions.push(':copy');

                return `redirect ${redOptions.join(' ')} ${JSON.stringify(action.parameters?.address || '')}`;

            case 'discard':
                return 'discard';

            case 'reject':
                return `reject ${JSON.stringify(action.parameters?.reason || '')}`;

            case 'addheader':
                return `addheader ${action.parameters?.last ? ':last ' : ''}${JSON.stringify(action.parameters?.name || '')} ${JSON.stringify(action.parameters?.value || '')}`;

            case 'deleteheader':
                const dhOptions = [];
                if (action.parameters?.index) dhOptions.push(`:index ${action.parameters.index}`);
                if (action.parameters?.last) dhOptions.push(':last');
                if (action.parameters?.matchType) dhOptions.push(action.parameters.matchType);
                if (action.parameters?.comparator !== 'i;ascii-casemap')
                    dhOptions.push(`:comparator "${action.parameters.comparator}"`);

                return `deleteheader ${dhOptions.join(' ')} ${JSON.stringify(action.parameters?.name || '')} ${action.parameters?.value ? JSON.stringify(action.parameters.value) : ''}`;

            case 'stop':
                return 'stop';

            case 'vacation':
                const vacOptions = [];
                if (action.parameters?.days) vacOptions.push(`:days ${action.parameters.days}`);
                if (action.parameters?.subject) vacOptions.push(`:subject ${JSON.stringify(action.parameters.subject)}`);

                return `vacation ${vacOptions.join(' ')} ${JSON.stringify(action.parameters?.message || '')}`;

            default:
                return '';
        }
    }, []);

    // Toggle code editing mode
    const toggleCodeEditMode = useCallback(() => {
        if (!codeEditMode) {
            // Entering edit mode
            setEditedCode(generatedCode);
            setCodeEditMode(true);
        } else {
            // Exiting edit mode - parse the edited code
            try {
                const parsedScript = parseSieveScript(editedCode);
                if (parsedScript && parsedScript.rules) {
                    setRules(parsedScript.rules);
                    if (parsedScript.extensions) {
                        setExtensions(prev => ({
                            ...prev,
                            ...parsedScript.extensions
                        }));
                    }
                    setCodeEditMode(false);
                    showNotification("Script updated from code", "success");
                } else {
                    if (!window.confirm("Unable to fully parse the script. Exit edit mode anyway?")) {
                        return;
                    }
                    setCodeEditMode(false);
                }
            } catch (e) {
                console.error("Error parsing edited code:", e);
                if (window.confirm("Error parsing code. Discard changes and exit edit mode?")) {
                    setCodeEditMode(false);
                }
            }
        }
    }, [codeEditMode, generatedCode, editedCode, showNotification]);

    // Copy generated code to clipboard
    const copyToClipboard = useCallback(() => {
        const codeToCopy = codeEditMode ? editedCode : generatedCode;
        navigator.clipboard.writeText(codeToCopy)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                showNotification("Code copied to clipboard", "success");
            })
            .catch(err => {
                console.error('Error copying to clipboard:', err);
                showNotification("Failed to copy to clipboard", "error");
            });
    }, [generatedCode, editedCode, codeEditMode, showNotification]);

    // Download generated code as a .sieve file
    const downloadCode = useCallback(() => {
        const filename = 'filter.sieve';
        const codeToDownload = codeEditMode ? editedCode : generatedCode;
        const blob = new Blob([codeToDownload], {type: 'text/plain'});

        // Create an object URL for the blob
        const url = URL.createObjectURL(blob);

        // Update the download link
        if (downloadLinkRef.current) {
            downloadLinkRef.current.href = url;
            downloadLinkRef.current.download = filename;
            downloadLinkRef.current.click();

            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);

            showNotification(`Downloaded as ${filename}`, "success");
        }
    }, [generatedCode, editedCode, codeEditMode, showNotification]);

    // Import code from file
    const importCode = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            try {
                // Try to parse the Sieve script
                const result = parseSieveScript(content);

                if (result && result.rules && result.rules.length > 0) {
                    if (window.confirm("Import this script? This will replace your current script.")) {
                        setRules(result.rules);

                        if (result.extensions) {
                            setExtensions(prev => ({
                                ...prev,
                                ...result.extensions
                            }));
                        }

                        showNotification("Script imported successfully", "success");
                    }
                } else {
                    showNotification("Could not parse the script file. Please check the format.", "error");
                }
            } catch (error) {
                console.error('Error parsing Sieve code:', error);
                showNotification("Failed to parse the Sieve code", "error");
            }

            // Reset the file input
            if (importFileRef.current) {
                importFileRef.current.value = "";
            }
        };
        reader.readAsText(file);
    }, [showNotification]);

    // Create a new script
    const newScript = useCallback(() => {
        if (rules.length > 0) {
            if (window.confirm("Create a new script? This will clear your current script.")) {
                setRules([]);
                addRule();
                showNotification("Created new script", "success");
            }
        } else {
            addRule();
            showNotification("Created new script", "success");
        }
    }, [rules, addRule, showNotification]);

    // Handle code editor changes
    const handleCodeChange = useCallback((e) => {
        setEditedCode(e.target.value);
    }, []);

    // Notification component (rendered inline)
    const NotificationComponent = useMemo(() => {
        if (!notification) return null;

        const bgColor = notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-800' :
            notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-800' :
                'bg-blue-100 border-blue-400 text-blue-800';

        const icon = notification.type === 'error' ? <AlertTriangle className="h-5 w-5 mr-2"/> :
            notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2"/> :
                <Info className="h-5 w-5 mr-2"/>;

        return (
            <div
                className={`fixed bottom-4 right-4 px-4 py-3 rounded border ${bgColor} flex items-center shadow-lg z-50`}>
                {icon}
                <span>{notification.message}</span>
                <button
                    onClick={() => setNotification(null)}
                    className="ml-4 text-gray-600 hover:text-gray-800"
                >
                    <X className="h-4 w-4"/>
                </button>
            </div>
        );
    }, [notification]);

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            {NotificationComponent}

            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Sieve Script Editor</h1>
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="ml-2 text-gray-500 hover:text-blue-600"
                            aria-label="Help"
                            title="Show help information"
                        >
                            <HelpCircle className="h-5 w-5"/>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={newScript}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center"
                            title="Create a new script"
                        >
                            <FileText className="mr-1 h-4 w-4"/>
                            New
                        </button>

                        <button
                            onClick={() => setShowTemplates(true)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center"
                            title="Load a template"
                        >
                            <Copy className="mr-1 h-4 w-4"/>
                            Templates
                        </button>

                        <label
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center cursor-pointer">
                            <input
                                ref={importFileRef}
                                type="file"
                                accept=".sieve,.txt"
                                onChange={importCode}
                                className="hidden"
                            />
                            <Upload className="mr-1 h-4 w-4"/>
                            Import
                        </label>

                        <button
                            onClick={() => setShowCode(!showCode)}
                            className={`px-3 py-2 ${showCode ? 'bg-blue-700' : 'bg-blue-600'} hover:bg-blue-700 text-white rounded flex items-center`}
                            title={showCode ? "Hide generated code" : "Show generated code"}
                        >
                            <Code className="mr-1 h-4 w-4"/>
                            {showCode ? 'Hide Code' : 'Show Code'}
                        </button>

                        <button
                            onClick={copyToClipboard}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center relative"
                            title="Copy code to clipboard"
                        >
                            {copied ? <CopyCheck className="mr-1 h-4 w-4"/> : <Clipboard className="mr-1 h-4 w-4"/>}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>

                        <button
                            onClick={downloadCode}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center"
                            title="Download as .sieve file"
                        >
                            <Download className="mr-1 h-4 w-4"/>
                            Download
                        </button>
                        <a ref={downloadLinkRef} className="hidden"></a>
                    </div>
                </div>

                {showHelp && (
                    <div className="mt-4 bg-blue-50 p-4 rounded text-sm">
                        <h2 className="font-bold text-blue-800 mb-2">How to use this editor:</h2>
                        <ol className="list-decimal pl-5 space-y-1 text-blue-900">
                            <li>Create filtering rules by adding conditions (what to match) and actions (what to do)
                            </li>
                            <li>Enable required extensions in the sidebar when using specific features</li>
                            <li>Use the "Show Code" button to see the generated Sieve script</li>
                            <li>You can directly edit the code and update the GUI from your changes</li>
                            <li>Duplicate rules to quickly create similar filters</li>
                            <li>Download your script for use with any Sieve-compatible mail server</li>
                        </ol>
                        <p className="mt-2 text-blue-800">Your script is automatically saved in your browser as you
                            work.</p>
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Validation warnings */}
            {validationWarnings.length > 0 && !codeEditMode && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0"/>
                        <div>
                            <h3 className="font-medium text-yellow-800">Script Warnings</h3>
                            <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                                {validationWarnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Templates modal */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Script Templates</h2>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Close templates dialog"
                            >
                                <X className="h-5 w-5"/>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                            {Object.entries(SCRIPT_TEMPLATES).map(([key, template]) => (
                                <button
                                    key={key}
                                    onClick={() => loadTemplate(key)}
                                    className="text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                                >
                                    <span className="font-medium">{template.name}</span>
                                    <ChevronRight className="h-4 w-4 text-gray-400"/>
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!codeEditMode && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-3">
                        {/* Rules section */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-semibold">Rules</h2>
                                    <HelpTooltip text={HELP_TEXT.rule}>
                                        <button aria-label="Information about rules"
                                                className="ml-1 text-gray-400 hover:text-blue-500">
                                            <HelpCircle className="h-4 w-4"/>
                                        </button>
                                    </HelpTooltip>
                                </div>
                                <button
                                    onClick={addRule}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center text-sm"
                                    aria-label="Add rule"
                                >
                                    <Plus className="mr-1 h-4 w-4"/>
                                    Add Rule
                                </button>
                            </div>

                            {rules.length === 0 ? (
                                <div
                                    className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <div className="flex flex-col items-center">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mb-2"/>
                                        <h3 className="text-lg font-medium text-gray-600 mb-1">No Rules Defined</h3>
                                        <p className="text-gray-500 max-w-md mb-4">Create a rule to start building your
                                            email filtering script.</p>
                                        <button
                                            onClick={addRule}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
                                        >
                                            <Plus className="mr-1 h-4 w-4"/>
                                            Add First Rule
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {rules.map((rule, index) => (
                                        <div
                                            key={rule.id}
                                            className={`border rounded-lg p-4 ${rule.active ? 'border-blue-400' : 'border-gray-300 bg-gray-50'}`}
                                        >
                                            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => toggleRuleActive(rule.id)}
                                                        className="mr-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                                        title={rule.active ? "Disable rule" : "Enable rule"}
                                                        aria-label={rule.active ? "Disable rule" : "Enable rule"}
                                                    >
                                                        {rule.active ? (
                                                            <CheckSquare className="h-5 w-5 text-blue-500"/>
                                                        ) : (
                                                            <Square className="h-5 w-5"/>
                                                        )}
                                                    </button>
                                                    <h3 className="text-lg font-medium">Rule {index + 1}</h3>
                                                    {!rule.active && (
                                                        <span
                                                            className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                              Disabled
                            </span>
                                                    )}
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => moveRuleUp(index)}
                                                        disabled={index === 0}
                                                        className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        title="Move rule up"
                                                        aria-label="Move rule up"
                                                    >
                                                        <ArrowUp className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => moveRuleDown(index)}
                                                        disabled={index === rules.length - 1}
                                                        className={`p-1 rounded ${index === rules.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        title="Move rule down"
                                                        aria-label="Move rule down"
                                                    >
                                                        <ArrowDown className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => duplicateRule(rule.id)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Duplicate rule"
                                                        aria-label="Duplicate rule"
                                                    >
                                                        <Copy className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => removeRule(rule.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete rule"
                                                        aria-label="Delete rule"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Conditions Section */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center">
                                                        <h4 className="font-medium">If {rule.conditions.length > 1 && (
                                                            <button
                                                                onClick={() => toggleCombinator(rule.id)}
                                                                className="text-blue-600 text-sm underline"
                                                            >
                                                                {rule.combinator === 'anyof' ? 'any' : 'all'} of the
                                                                following conditions
                                                            </button>
                                                        )}</h4>

                                                        {rule.conditions.length > 1 && (
                                                            <HelpTooltip
                                                                text={rule.combinator === 'anyof' ? HELP_TEXT.anyof : HELP_TEXT.allof}>
                                                                <button aria-label="Combinator information"
                                                                        className="ml-1 text-gray-400 hover:text-blue-500">
                                                                    <HelpCircle className="h-4 w-4"/>
                                                                </button>
                                                            </HelpTooltip>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => addCondition(rule.id)}
                                                        className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                                                        aria-label="Add condition"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1"/>
                                                        Add Condition
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {rule.conditions.map((condition, condIndex) => (
                                                        <div key={condIndex}
                                                             className="flex items-start space-x-2 bg-gray-50 p-2 rounded">
                                                            <ConditionBuilder
                                                                condition={condition}
                                                                onChange={(updates) => updateCondition(rule.id, condIndex, updates)}
                                                                extensions={extensions}
                                                            />
                                                            <button
                                                                onClick={() => removeCondition(rule.id, condIndex)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded mt-1"
                                                                aria-label="Remove condition"
                                                            >
                                                                <X className="h-4 w-4"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions Section */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-medium">Then</h4>
                                                    <button
                                                        onClick={() => addAction(rule.id)}
                                                        className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                                                        aria-label="Add action"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1"/>
                                                        Add Action
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {rule.actions.map((action, actionIndex) => (
                                                        <div key={actionIndex}
                                                             className="flex items-start space-x-2 bg-gray-50 p-2 rounded">
                                                            <ActionBuilder
                                                                action={action}
                                                                onChange={(updates) => updateAction(rule.id, actionIndex, updates)}
                                                                extensions={extensions}
                                                            />
                                                            <button
                                                                onClick={() => removeAction(rule.id, actionIndex)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded mt-1"
                                                                aria-label="Remove action"
                                                            >
                                                                <X className="h-4 w-4"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={addRule}
                                    className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
                                    aria-label="Add rule"
                                >
                                    <Plus className="mr-1 h-4 w-4"/>
                                    Add Rule
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {/* Extensions section */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Extensions</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setExpandedCategories({
                                            core: true,
                                            actions: true,
                                            tests: true,
                                            message: true,
                                            advanced: true
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                        title="Expand all categories"
                                    >
                                        Expand All
                                    </button>
                                    <button
                                        onClick={() => setExpandedCategories({
                                            core: false,
                                            actions: false,
                                            tests: false,
                                            message: false,
                                            advanced: false
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                        title="Collapse all categories"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Core extensions */}
                                <div className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory('core')}
                                        className="w-full px-3 py-2 bg-gray-100 flex justify-between items-center font-medium"
                                        aria-expanded={expandedCategories.core}
                                    >
                                        Core Extensions
                                        {expandedCategories.core ? <ChevronDown className="h-4 w-4"/> :
                                            <ChevronRight className="h-4 w-4"/>}
                                    </button>

                                    {expandedCategories.core && (
                                        <div className="p-3 space-y-2">
                                            {EXTENSION_CATEGORIES.core.map(ext => (
                                                <div key={ext} className="flex items-center group">
                                                    <input
                                                        type="checkbox"
                                                        id={`ext-${ext}`}
                                                        checked={extensions[ext]}
                                                        onChange={() => toggleExtension(ext)}
                                                        className="mr-2 h-4 w-4"
                                                        aria-label={`Enable ${ext} extension`}
                                                    />
                                                    <label htmlFor={`ext-${ext}`} className="flex-1">{ext}</label>
                                                    <HelpTooltip text={EXTENSION_DESCRIPTIONS[ext]} position="left">
                                                        <button
                                                            className="text-gray-400 hover:text-blue-600"
                                                            aria-label={`Information about ${ext} extension`}
                                                        >
                                                            <Info className="h-4 w-4"/>
                                                        </button>
                                                    </HelpTooltip>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action extensions */}
                                <div className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory('actions')}
                                        className="w-full px-3 py-2 bg-gray-100 flex justify-between items-center font-medium"
                                        aria-expanded={expandedCategories.actions}
                                    >
                                        Action Extensions
                                        {expandedCategories.actions ? <ChevronDown className="h-4 w-4"/> :
                                            <ChevronRight className="h-4 w-4"/>}
                                    </button>

                                    {expandedCategories.actions && (
                                        <div className="p-3 space-y-2">
                                            {EXTENSION_CATEGORIES.actions.map(ext => (
                                                <div key={ext} className="flex items-center group">
                                                    <input
                                                        type="checkbox"
                                                        id={`ext-${ext}`}
                                                        checked={extensions[ext]}
                                                        onChange={() => toggleExtension(ext)}
                                                        className="mr-2 h-4 w-4"
                                                        aria-label={`Enable ${ext} extension`}
                                                    />
                                                    <label htmlFor={`ext-${ext}`} className="flex-1">{ext}</label>
                                                    <HelpTooltip text={EXTENSION_DESCRIPTIONS[ext]} position="left">
                                                        <button
                                                            className="text-gray-400 hover:text-blue-600"
                                                            aria-label={`Information about ${ext} extension`}
                                                        >
                                                            <Info className="h-4 w-4"/>
                                                        </button>
                                                    </HelpTooltip>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Test extensions */}
                                <div className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory('tests')}
                                        className="w-full px-3 py-2 bg-gray-100 flex justify-between items-center font-medium"
                                        aria-expanded={expandedCategories.tests}
                                    >
                                        Test Extensions
                                        {expandedCategories.tests ? <ChevronDown className="h-4 w-4"/> :
                                            <ChevronRight className="h-4 w-4"/>}
                                    </button>

                                    {expandedCategories.tests && (
                                        <div className="p-3 space-y-2">
                                            {EXTENSION_CATEGORIES.tests.map(ext => (
                                                <div key={ext} className="flex items-center group">
                                                    <input
                                                        type="checkbox"
                                                        id={`ext-${ext}`}
                                                        checked={extensions[ext]}
                                                        onChange={() => toggleExtension(ext)}
                                                        className="mr-2 h-4 w-4"
                                                        aria-label={`Enable ${ext} extension`}
                                                    />
                                                    <label htmlFor={`ext-${ext}`} className="flex-1">{ext}</label>
                                                    <HelpTooltip text={EXTENSION_DESCRIPTIONS[ext]} position="left">
                                                        <button
                                                            className="text-gray-400 hover:text-blue-600"
                                                            aria-label={`Information about ${ext} extension`}
                                                        >
                                                            <Info className="h-4 w-4"/>
                                                        </button>
                                                    </HelpTooltip>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Message extensions */}
                                <div className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory('message')}
                                        className="w-full px-3 py-2 bg-gray-100 flex justify-between items-center font-medium"
                                        aria-expanded={expandedCategories.message}
                                    >
                                        Message Extensions
                                        {expandedCategories.message ? <ChevronDown className="h-4 w-4"/> :
                                            <ChevronRight className="h-4 w-4"/>}
                                    </button>

                                    {expandedCategories.message && (
                                        <div className="p-3 space-y-2">
                                            {EXTENSION_CATEGORIES.message.map(ext => (
                                                <div key={ext} className="flex items-center group">
                                                    <input
                                                        type="checkbox"
                                                        id={`ext-${ext}`}
                                                        checked={extensions[ext]}
                                                        onChange={() => toggleExtension(ext)}
                                                        className="mr-2 h-4 w-4"
                                                        aria-label={`Enable ${ext} extension`}
                                                    />
                                                    <label htmlFor={`ext-${ext}`} className="flex-1">{ext}</label>
                                                    <HelpTooltip text={EXTENSION_DESCRIPTIONS[ext]} position="left">
                                                        <button
                                                            className="text-gray-400 hover:text-blue-600"
                                                            aria-label={`Information about ${ext} extension`}
                                                        >
                                                            <Info className="h-4 w-4"/>
                                                        </button>
                                                    </HelpTooltip>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Advanced extensions */}
                                <div className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory('advanced')}
                                        className="w-full px-3 py-2 bg-gray-100 flex justify-between items-center font-medium"
                                        aria-expanded={expandedCategories.advanced}
                                    >
                                        Advanced Extensions
                                        {expandedCategories.advanced ? <ChevronDown className="h-4 w-4"/> :
                                            <ChevronRight className="h-4 w-4"/>}
                                    </button>

                                    {expandedCategories.advanced && (
                                        <div className="p-3 space-y-2">
                                            {EXTENSION_CATEGORIES.advanced.map(ext => (
                                                <div key={ext} className="flex items-center group">
                                                    <input
                                                        type="checkbox"
                                                        id={`ext-${ext}`}
                                                        checked={extensions[ext]}
                                                        onChange={() => toggleExtension(ext)}
                                                        className="mr-2 h-4 w-4"
                                                        aria-label={`Enable ${ext} extension`}
                                                    />
                                                    <label htmlFor={`ext-${ext}`} className="flex-1">{ext}</label>
                                                    <HelpTooltip text={EXTENSION_DESCRIPTIONS[ext]} position="left">
                                                        <button
                                                            className="text-gray-400 hover:text-blue-600"
                                                            aria-label={`Information about ${ext} extension`}
                                                        >
                                                            <Info className="h-4 w-4"/>
                                                        </button>
                                                    </HelpTooltip>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Code view */}
            {showCode && (
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">
                            {codeEditMode ? 'Edit Sieve Code' : 'Generated Sieve Code'}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={toggleCodeEditMode}
                                className={`px-2 py-1 text-sm ${codeEditMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded flex items-center`}
                                title={codeEditMode ? "Apply changes and exit edit mode" : "Edit code directly"}
                            >
                                {codeEditMode ? (
                                    <>
                                        <PlayCircle className="mr-1 h-4 w-4"/>
                                        Apply Changes
                                    </>
                                ) : (
                                    <>
                                        <Edit className="mr-1 h-4 w-4"/>
                                        Edit Code
                                    </>
                                )}
                            </button>

                            <button
                                onClick={copyToClipboard}
                                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center"
                                title="Copy code to clipboard"
                            >
                                <Copy className="mr-1 h-4 w-4"/>
                                Copy
                            </button>

                            <button
                                onClick={downloadCode}
                                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center"
                                title="Download as .sieve file"
                            >
                                <Download className="mr-1 h-4 w-4"/>
                                Download
                            </button>
                        </div>
                    </div>

                    {codeEditMode ? (
                        <div className="bg-gray-100 rounded border border-gray-300">
              <textarea
                  ref={codeEditorRef}
                  value={editedCode}
                  onChange={handleCodeChange}
                  className="w-full h-96 p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
                  spellCheck="false"
              />
                        </div>
                    ) : (
                        <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre text-sm">
              {generatedCode || '# No code generated yet'}
            </pre>
                    )}

                    {codeEditMode && (
                        <div className="mt-3 flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setEditedCode(generatedCode);
                                    showNotification("Changes discarded", "info");
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded flex items-center"
                            >
                                <RotateCcw className="mr-1 h-4 w-4"/>
                                Reset
                            </button>
                            <button
                                onClick={toggleCodeEditMode}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
                            >
                                <PlayCircle className="mr-1 h-4 w-4"/>
                                Apply Changes
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Component to build a condition
const ConditionBuilder = React.memo(function ConditionBuilder({condition, onChange, extensions}) {
    // Get help text for current condition type
    const conditionTypeHelp = HELP_TEXT.conditionTypes[condition.type] || "Configure what to check in this condition";

    const handleTypeChange = (newType) => {
        let newCondition = {type: newType};

        // Set default fields based on type
        switch (newType) {
            case 'header':
                newCondition = {
                    ...newCondition,
                    comparator: 'i;ascii-casemap',
                    matchType: ':is',
                    header: 'Subject',
                    keys: ['']
                };
                break;

            case 'address':
                newCondition = {
                    ...newCondition,
                    comparator: 'i;ascii-casemap',
                    matchType: ':is',
                    addressPart: ':all',
                    header: 'From',
                    keys: ['']
                };
                break;

            case 'envelope':
                newCondition = {
                    ...newCondition,
                    comparator: 'i;ascii-casemap',
                    matchType: ':is',
                    addressPart: ':all',
                    part: 'from',
                    keys: ['']
                };
                break;

            case 'size':
                newCondition = {
                    ...newCondition,
                    operator: ':over',
                    size: '100K'
                };
                break;

            case 'body':
                newCondition = {
                    ...newCondition,
                    comparator: 'i;ascii-casemap',
                    matchType: ':contains',
                    transform: ':text',
                    keys: ['']
                };
                break;

            case 'exists':
                newCondition = {
                    ...newCondition,
                    header: ['Subject']
                };
                break;

            default:
                break;
        }

        onChange(newCondition);
    };

    return (
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <div className="flex items-center col-span-1">
                <select
                    value={condition.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    aria-label="Condition type"
                >
                    <option value="header">Header</option>
                    <option value="address">Address</option>
                    {extensions.envelope && <option value="envelope">Envelope</option>}
                    <option value="size">Size</option>
                    {extensions.body && <option value="body">Body</option>}
                    <option value="exists">Exists</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
                <HelpTooltip text={conditionTypeHelp} position="right">
                    <button aria-label="Condition type help" className="ml-1 text-gray-400 hover:text-blue-500">
                        <HelpCircle className="h-4 w-4"/>
                    </button>
                </HelpTooltip>
            </div>

            {condition.type === 'header' && (
                <>
                    <div className="flex items-center col-span-1">
                        <select
                            value={condition.matchType}
                            onChange={(e) => onChange({matchType: e.target.value})}
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Match type"
                        >
                            <option value=":is">is</option>
                            <option value=":contains">contains</option>
                            <option value=":matches">matches</option>
                        </select>
                        <HelpTooltip
                            text={HELP_TEXT.matchTypes[condition.matchType?.replace(':', '') || 'is']}
                            position="right"
                        >
                            <button aria-label="Match type help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <input
                        type="text"
                        value={condition.header}
                        onChange={(e) => onChange({header: e.target.value})}
                        placeholder="Header name"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Header name"
                    />

                    <input
                        type="text"
                        value={Array.isArray(condition.keys) ? condition.keys[0] : condition.keys || ''}
                        onChange={(e) => onChange({keys: [e.target.value]})}
                        placeholder="Value"
                        className="px-2 py-1 border rounded text-sm col-span-2"
                        aria-label="Header value"
                    />
                </>
            )}

            {condition.type === 'address' && (
                <>
                    <div className="flex items-center col-span-1">
                        <select
                            value={condition.matchType}
                            onChange={(e) => onChange({matchType: e.target.value})}
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Match type"
                        >
                            <option value=":is">is</option>
                            <option value=":contains">contains</option>
                            <option value=":matches">matches</option>
                        </select>
                        <HelpTooltip
                            text={HELP_TEXT.matchTypes[condition.matchType?.replace(':', '') || 'is']}
                            position="right"
                        >
                            <button aria-label="Match type help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <div className="flex items-center col-span-1">
                        <select
                            value={condition.addressPart}
                            onChange={(e) => onChange({addressPart: e.target.value})}
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Address part"
                        >
                            <option value=":all">all</option>
                            <option value=":localpart">local part</option>
                            <option value=":domain">domain</option>
                        </select>
                        <HelpTooltip
                            text={HELP_TEXT.addressParts[condition.addressPart?.replace(':', '') || 'all']}
                            position="right"
                        >
                            <button aria-label="Address part help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <input
                        type="text"
                        value={condition.header}
                        onChange={(e) => onChange({header: e.target.value})}
                        placeholder="Header (From, To, Cc)"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Address header"
                    />

                    <input
                        type="text"
                        value={Array.isArray(condition.keys) ? condition.keys[0] : condition.keys || ''}
                        onChange={(e) => onChange({keys: [e.target.value]})}
                        placeholder="Address"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Address value"
                    />
                </>
            )}

            {condition.type === 'envelope' && (
                <>
                    <select
                        value={condition.matchType}
                        onChange={(e) => onChange({matchType: e.target.value})}
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Match type"
                    >
                        <option value=":is">is</option>
                        <option value=":contains">contains</option>
                        <option value=":matches">matches</option>
                    </select>

                    <select
                        value={condition.addressPart}
                        onChange={(e) => onChange({addressPart: e.target.value})}
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Address part"
                    >
                        <option value=":all">all</option>
                        <option value=":localpart">local part</option>
                        <option value=":domain">domain</option>
                    </select>

                    <select
                        value={condition.part}
                        onChange={(e) => onChange({part: e.target.value})}
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Envelope part"
                    >
                        <option value="from">from</option>
                        <option value="to">to</option>
                    </select>

                    <input
                        type="text"
                        value={Array.isArray(condition.keys) ? condition.keys[0] : condition.keys || ''}
                        onChange={(e) => onChange({keys: [e.target.value]})}
                        placeholder="Address"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Envelope address"
                    />
                </>
            )}

            {condition.type === 'size' && (
                <>
                    <div className="flex items-center col-span-1">
                        <select
                            value={condition.operator}
                            onChange={(e) => onChange({operator: e.target.value})}
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Size operator"
                        >
                            <option value=":over">over</option>
                            <option value=":under">under</option>
                        </select>
                        <HelpTooltip
                            text="Whether the message size should be larger or smaller than the specified size">
                            <button aria-label="Size operator help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <div className="flex items-center col-span-1">
                        <input
                            type="text"
                            value={condition.size}
                            onChange={(e) => onChange({size: e.target.value})}
                            placeholder="Size (e.g., 100K)"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Message size"
                        />
                        <HelpTooltip
                            text="Size can be specified in K (kilobytes), M (megabytes), or G (gigabytes), e.g., 10K, 2M">
                            <button aria-label="Size format help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>
                </>
            )}

            {condition.type === 'body' && (
                <>
                    <div className="flex items-center col-span-1">
                        <select
                            value={condition.matchType}
                            onChange={(e) => onChange({matchType: e.target.value})}
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Match type"
                        >
                            <option value=":is">is</option>
                            <option value=":contains">contains</option>
                            <option value=":matches">matches</option>
                        </select>
                        <HelpTooltip
                            text={HELP_TEXT.matchTypes[condition.matchType?.replace(':', '') || 'is']}
                            position="right"
                        >
                            <button aria-label="Match type help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <div className="flex items-center col-span-1">
                        <select
                            value={condition.transform}
                            onChange={(e) => onChange({transform: e.target.value})}
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Body transform"
                        >
                            <option value=":text">text</option>
                            <option value=":raw">raw</option>
                            <option value=":content">content</option>
                        </select>
                        <HelpTooltip
                            text={HELP_TEXT.bodyTransforms[condition.transform?.replace(':', '') || 'text']}
                            position="right"
                        >
                            <button aria-label="Body transform help" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <input
                        type="text"
                        value={Array.isArray(condition.keys) ? condition.keys[0] : condition.keys || ''}
                        onChange={(e) => onChange({keys: [e.target.value]})}
                        placeholder="Text to match"
                        className="px-2 py-1 border rounded text-sm col-span-2"
                        aria-label="Body text to match"
                    />
                </>
            )}

            {condition.type === 'exists' && (
                <>
                    <div className="flex items-center col-span-2">
                        <input
                            type="text"
                            value={Array.isArray(condition.header) ? condition.header.join(', ') : condition.header || ''}
                            onChange={(e) => onChange({header: e.target.value.split(/\s*,\s*/)})}
                            placeholder="Header name(s)"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Headers to check for existence"
                        />
                        <HelpTooltip
                            text="Checks if these headers exist in the message. Multiple headers can be separated by commas">
                            <button aria-label="Exists condition help"
                                    className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>
                </>
            )}
        </div>
    );
});

// Component to build an action
// Component to build an action
const ActionBuilder = React.memo(function ActionBuilder({action, onChange, extensions}) {
    // Get help text for current action type
    const actionTypeHelp = HELP_TEXT.actionTypes[action.type] || "Configure what happens when this rule matches";

    const handleTypeChange = (newType) => {
        let newAction = {type: newType};

        // Set default fields based on type
        switch (newType) {
            case 'keep':
                // No additional parameters needed
                break;

            case 'fileinto':
                newAction = {
                    ...newAction,
                    parameters: {
                        mailbox: 'INBOX.Filtered',
                        create: false,
                        flags: [],
                        copy: false
                    }
                };
                break;

            case 'redirect':
                newAction = {
                    ...newAction,
                    parameters: {
                        address: 'user@example.com',
                        copy: false
                    }
                };
                break;

            case 'discard':
                // No additional parameters needed
                break;

            case 'reject':
                newAction = {
                    ...newAction,
                    parameters: {
                        reason: 'Message rejected.'
                    }
                };
                break;

            case 'addheader':
                newAction = {
                    ...newAction,
                    parameters: {
                        name: 'X-Sieve-Filtered',
                        value: 'yes',
                        last: false
                    }
                };
                break;

            case 'deleteheader':
                newAction = {
                    ...newAction,
                    parameters: {
                        name: 'X-Unwanted-Header',
                        value: null,
                        index: null,
                        last: false,
                        matchType: null,
                        comparator: 'i;ascii-casemap'
                    }
                };
                break;

            case 'stop':
                // No additional parameters needed
                break;

            case 'vacation':
                newAction = {
                    ...newAction,
                    parameters: {
                        days: 7,
                        subject: 'Out of Office',
                        message: "I am currently away and will reply to your email when I return."
                    }
                };
                break;

            default:
                break;
        }

        onChange(newAction);
    };

    // Helper to update parameters
    const updateParameters = (updates) => {
        onChange({
            parameters: {
                ...action.parameters,
                ...updates
            }
        });
    };

    return (
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <div className="flex items-center col-span-1">
                <select
                    value={action.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    aria-label="Action type"
                >
                    <option value="keep">Keep</option>
                    {extensions.fileinto && <option value="fileinto">File Into</option>}
                    <option value="redirect">Redirect</option>
                    <option value="discard">Discard</option>
                    {extensions.reject && <option value="reject">Reject</option>}
                    {extensions.editheader && <option value="addheader">Add Header</option>}
                    {extensions.editheader && <option value="deleteheader">Delete Header</option>}
                    <option value="stop">Stop</option>
                    {extensions.vacation && <option value="vacation">Vacation</option>}
                </select>
                <HelpTooltip text={actionTypeHelp} position="right">
                    <button aria-label="Action type help" className="ml-1 text-gray-400 hover:text-blue-500">
                        <HelpCircle className="h-4 w-4"/>
                    </button>
                </HelpTooltip>
            </div>

            {action.type === 'fileinto' && (
                <>
                    <div className="flex items-center col-span-2">
                        <input
                            type="text"
                            value={action.parameters?.mailbox || ''}
                            onChange={(e) => updateParameters({mailbox: e.target.value})}
                            placeholder="Mailbox"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Destination mailbox"
                        />
                        <HelpTooltip text="The folder where matching messages will be delivered">
                            <button aria-label="Mailbox information" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    {extensions.copy && (
                        <div className="flex items-center col-span-1">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={action.parameters?.copy || false}
                                    onChange={(e) => updateParameters({copy: e.target.checked})}
                                    className="mr-1"
                                    aria-label="Keep copy in inbox"
                                />
                                <span className="text-sm">Copy</span>
                            </label>
                            <HelpTooltip text={HELP_TEXT.fileOptions.copy}>
                                <button aria-label="Copy option information"
                                        className="ml-1 text-gray-400 hover:text-blue-500">
                                    <HelpCircle className="h-4 w-4"/>
                                </button>
                            </HelpTooltip>
                        </div>
                    )}

                    {extensions.mailbox && (
                        <div className="flex items-center col-span-1">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={action.parameters?.create || false}
                                    onChange={(e) => updateParameters({create: e.target.checked})}
                                    className="mr-1"
                                    aria-label="Create mailbox if not exists"
                                />
                                <span className="text-sm">Create</span>
                            </label>
                            <HelpTooltip text={HELP_TEXT.fileOptions.create}>
                                <button aria-label="Create option information"
                                        className="ml-1 text-gray-400 hover:text-blue-500">
                                    <HelpCircle className="h-4 w-4"/>
                                </button>
                            </HelpTooltip>
                        </div>
                    )}
                </>
            )}

            {action.type === 'redirect' && (
                <>
                    <div className="flex items-center col-span-2">
                        <input
                            type="text"
                            value={action.parameters?.address || ''}
                            onChange={(e) => updateParameters({address: e.target.value})}
                            placeholder="Email address"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Redirect email address"
                        />
                        <HelpTooltip text="The email address where the message will be forwarded">
                            <button aria-label="Redirect address information"
                                    className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    {extensions.copy && (
                        <div className="flex items-center col-span-1">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={action.parameters?.copy || false}
                                    onChange={(e) => updateParameters({copy: e.target.checked})}
                                    className="mr-1"
                                    aria-label="Keep copy in inbox"
                                />
                                <span className="text-sm">Copy</span>
                            </label>
                            <HelpTooltip text="Also keep a copy of the message in the inbox">
                                <button aria-label="Copy option information"
                                        className="ml-1 text-gray-400 hover:text-blue-500">
                                    <HelpCircle className="h-4 w-4"/>
                                </button>
                            </HelpTooltip>
                        </div>
                    )}
                </>
            )}

            {action.type === 'reject' && (
                <>
                    <div className="flex items-center col-span-3">
                        <input
                            type="text"
                            value={action.parameters?.reason || ''}
                            onChange={(e) => updateParameters({reason: e.target.value})}
                            placeholder="Rejection reason"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Rejection reason"
                        />
                        <HelpTooltip text="Explanation sent back to the sender about why their message was rejected">
                            <button aria-label="Rejection reason information"
                                    className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>
                </>
            )}

            {action.type === 'addheader' && (
                <>
                    <input
                        type="text"
                        value={action.parameters?.name || ''}
                        onChange={(e) => updateParameters({name: e.target.value})}
                        placeholder="Header name"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Header name"
                    />

                    <input
                        type="text"
                        value={action.parameters?.value || ''}
                        onChange={(e) => updateParameters({value: e.target.value})}
                        placeholder="Header value"
                        className="px-2 py-1 border rounded text-sm col-span-2"
                        aria-label="Header value"
                    />

                    <label className="flex items-center col-span-1">
                        <input
                            type="checkbox"
                            checked={action.parameters?.last || false}
                            onChange={(e) => updateParameters({last: e.target.checked})}
                            className="mr-1"
                            aria-label="Add as last header"
                        />
                        <span className="text-sm">Add Last</span>
                    </label>
                </>
            )}

            {action.type === 'deleteheader' && (
                <>
                    <input
                        type="text"
                        value={action.parameters?.name || ''}
                        onChange={(e) => updateParameters({name: e.target.value})}
                        placeholder="Header name"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Header name to delete"
                    />

                    <input
                        type="text"
                        value={action.parameters?.value || ''}
                        onChange={(e) => updateParameters({value: e.target.value})}
                        placeholder="Header value (optional)"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Header value to match (optional)"
                    />

                    <input
                        type="text"
                        value={action.parameters?.index || ''}
                        onChange={(e) => updateParameters({index: e.target.value})}
                        placeholder="Index (optional)"
                        className="px-2 py-1 border rounded text-sm col-span-1"
                        aria-label="Header index (optional)"
                    />

                    <label className="flex items-center col-span-1">
                        <input
                            type="checkbox"
                            checked={action.parameters?.last || false}
                            onChange={(e) => updateParameters({last: e.target.checked})}
                            className="mr-1"
                            aria-label="Delete last occurrence"
                        />
                        <span className="text-sm">Last</span>
                    </label>
                </>
            )}

            {action.type === 'vacation' && (
                <>
                    <div className="flex items-center col-span-1">
                        <input
                            type="number"
                            value={action.parameters?.days || 7}
                            onChange={(e) => updateParameters({days: parseInt(e.target.value) || 7})}
                            placeholder="Days"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Days between auto-replies"
                            min="1"
                        />
                        <HelpTooltip text={HELP_TEXT.vacationOptions.days}>
                            <button aria-label="Days information" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <div className="flex items-center col-span-2">
                        <input
                            type="text"
                            value={action.parameters?.subject || ''}
                            onChange={(e) => updateParameters({subject: e.target.value})}
                            placeholder="Reply subject"
                            className="px-2 py-1 border rounded text-sm w-full"
                            aria-label="Auto-reply subject"
                        />
                        <HelpTooltip text={HELP_TEXT.vacationOptions.subject}>
                            <button aria-label="Subject information" className="ml-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>

                    <div className="flex items-start col-span-3 row-span-2">
            <textarea
                value={action.parameters?.message || ''}
                onChange={(e) => updateParameters({message: e.target.value})}
                placeholder="Auto-reply message"
                className="px-2 py-1 border rounded text-sm w-full"
                rows="2"
                aria-label="Auto-reply message"
            />
                        <HelpTooltip text={HELP_TEXT.vacationOptions.message} position="right">
                            <button aria-label="Message information"
                                    className="ml-1 mt-1 text-gray-400 hover:text-blue-500">
                                <HelpCircle className="h-4 w-4"/>
                            </button>
                        </HelpTooltip>
                    </div>
                </>
            )}
        </div>
    );
});

export default SieveEditor;