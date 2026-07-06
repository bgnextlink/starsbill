const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the start of the current switch-based renderContent
const startMatch = content.indexOf('const renderContent = () => {\n    switch (activeMenu) {');
if (startMatch === -1) {
    console.error('Could not find start of new renderContent');
    process.exit(1);
}

// Find the start of the main App return
const mainReturnMatch = content.indexOf('  return (\n    <div className="min-h-screen bg-slate-900 flex">');
if (mainReturnMatch === -1) {
    console.error('Could not find main return');
    process.exit(1);
}

// Find the end of the new switch-based renderContent we generated
// It ends with   };
const endOfSwitchRender = content.indexOf('  };\n', startMatch);

if (endOfSwitchRender === -1) {
    console.error('Could not find end of switch renderContent');
    process.exit(1);
}

// We want to keep everything up to endOfSwitchRender + 5
// and then immediately jump to mainReturnMatch, discarding the extra garbage in between
const fixedContent = content.substring(0, endOfSwitchRender + 5) + '\n' + content.substring(mainReturnMatch);

// We also need to add imports for CheckCircle2 and AlertCircle
const importStatement = "import {\n  LayoutDashboard, Server, Users, Users2, MapPin, Router, Package, UserCheck, UserPlus,\n  WalletCards, Ticket, MessageSquare, ArrowRightLeft, CreditCard, Receipt, HandCoins,\n  FileText, Settings, Shield, Building2, TerminalSquare, Puzzle, UsersRound, Settings2,\n  LogOut, ChevronDown, ChevronRight, Menu, X, Activity, DollarSign, Download, Github, RefreshCw,\n  CheckCircle2, AlertCircle\n} from 'lucide-react';";

// Replace the original import statement
const newFixedContent = fixedContent.replace(/import \{[\s\S]*?\} from 'lucide-react';/, importStatement);

fs.writeFileSync('src/App.tsx', newFixedContent);
