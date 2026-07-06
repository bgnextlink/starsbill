<?php
$content = file_get_contents('admin/index.php');
$replacement = <<<HTML
            <?php else: ?>
                <!-- Default Fallback for unconfigured menus -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-white capitalize"><?= htmlspecialchars(str_replace('-', ' ', \$active_menu)) ?></h2>
                        <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i class="fas fa-plus mr-2"></i> Tambah Data
                        </button>
                    </div>
                    
                    <?= renderTable(['ID', 'Keterangan', 'Status'], [
                        ['<span class="font-mono text-xs">#001</span>', 'Data dummy untuk ' . htmlspecialchars(\$active_menu), '<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>'],
                        ['<span class="font-mono text-xs">#002</span>', 'Contoh konfigurasi 2', '<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>']
                    ]) ?>
                </div>
            <?php endif; ?>
HTML;

$content = preg_replace('/<\?php else: \?>.*?<\?php endif; \?>/s', $replacement, $content);
file_put_contents('admin/index.php', $content);
