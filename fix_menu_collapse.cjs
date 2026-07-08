const fs = require('fs');

let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldMenuCode = `                <?php if (is_array($item)): ?>
                    <div class="pt-4 pb-1">
                        <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"><?= htmlspecialchars($key) ?></p>
                        <div class="space-y-1">
                            <?php foreach ($item as $subItem): ?>
                                <a href="?menu=<?= urlencode($subItem) ?>" class="block px-3 py-2 rounded-lg text-sm transition-colors <?= $active_menu === $subItem ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' ?>">
                                    <?= htmlspecialchars($subItem) ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php else: ?>`;

const newMenuCode = `                <?php if (is_array($item)): ?>
                    <?php $is_active_group = in_array($active_menu, $item); ?>
                    <div class="pt-2 pb-1">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.fa-chevron-down').classList.toggle('rotate-180')" class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 hover:text-slate-300 transition-colors cursor-pointer">
                            <span><?= htmlspecialchars($key) ?></span>
                            <i class="fas fa-chevron-down transition-transform duration-200 <?= $is_active_group ? 'rotate-180' : '' ?>"></i>
                        </button>
                        <div class="space-y-1 <?= $is_active_group ? '' : 'hidden' ?>">
                            <?php foreach ($item as $subItem): ?>
                                <a href="?menu=<?= urlencode($subItem) ?>" class="block px-3 py-2 pl-6 rounded-lg text-sm transition-colors <?= $active_menu === $subItem ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' ?>">
                                    <?= htmlspecialchars($subItem) ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php else: ?>`;

if (phpContent.includes(oldMenuCode)) {
    phpContent = phpContent.replace(oldMenuCode, newMenuCode);
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs updated");
} else {
    console.log("Could not find the menu code block in generate_admin_php.cjs");
}
