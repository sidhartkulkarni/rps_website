# Source inventory

Audit date: 2026-11-06. Offline/read-only source inspection; no application/PHP/SQL execution, database connection, deployment, archive extraction, or changes to React. Source root: `/Users/siddharthkulkarni/Downloads/RPS FE WS`. Paths below are relative to `TransferNow-20261030We5tBjjq/api (1)` unless stated otherwise. Snapshot status is not proof of current production deployment.

## Scope and totals

13,270 regular files; 5,988,636,249 logical bytes (5.58 GiB), including nested archive files and extracted duplicates. These are logical sizes, not disk allocation or unique content. No symlink traversal was requested.

| Extension | Files |
| --- | --- |
| .php | 6677 |
| .js | 2442 |
| .png | 1358 |
| .html | 713 |
| .css | 461 |
| .jpg | 365 |
| .gif | 166 |
| (none) | 160 |
| .json | 154 |
| .md | 127 |
| .txt | 100 |
| .z | 84 |
| .ttf | 46 |
| .svg | 35 |
| .zip | 34 |
| .eot | 34 |
| .woff | 34 |
| .less | 32 |
| .scss | 31 |
| .coffee | 21 |
| .psd | 20 |
| .mp4 | 19 |
| .woff2 | 16 |
| .db | 14 |
| .otf | 13 |
| .webp | 9 |
| .swf | 9 |
| .rb | 8 |
| .crt | 8 |
| .exe | 8 |
| .map | 8 |
| .ico | 6 |
| .xml | 5 |
| .markdown | 5 |
| .jpeg | 4 |
| .yml | 4 |
| .ini | 4 |
| .sh | 3 |
| .sql | 2 |
| .webm | 2 |
| .avif | 2 |
| .lock | 2 |
| .skipped | 2 |
| .pem | 2 |
| .dll | 2 |
| .vtt | 2 |
| .fla | 2 |
| .styl | 2 |
| .yaml | 2 |
| .pdf | 1 |
| .shtml | 1 |
| .icc | 1 |
| .sublime-workspace | 1 |
| .sublime-project | 1 |
| .go | 1 |
| .py | 1 |
| .htm | 1 |
| .aspx | 1 |
| .xap | 1 |
| .template | 1 |

## Major directories and files

| Source-relative path | Logical bytes |
| --- | --- |
| TransferNow-20261030We5tBjjq/api (1).zip | 1689000138 |
| TransferNow-20261030We5tBjjq/api (1)/html-backup | 879338559 |
| TransferNow-20261030We5tBjjq/api (1)/assets | 833624896 |
| TransferNow-20261030We5tBjjq/api (1)/assets.zip | 738062545 |
| TransferNow-20261030We5tBjjq/api (1)/api | 99696444 |
| TransferNow-20261030We5tBjjq/api (1)/user-roles-video-manual.mp4 | 21984345 |
| TransferNow-20261030We5tBjjq/api (1)/application | 15055939 |
| TransferNow-20261030We5tBjjq/api (1)/bkp_application_7apr | 13692787 |
| TransferNow-20261030We5tBjjq/api (1)/quotevideo.mp4 | 5872359 |
| TransferNow-20261030We5tBjjq/api (1)/system | 1847257 |
| TransferNow-20261030We5tBjjq/api (1)/user-roles-summary.pdf | 385630 |
| TransferNow-20261030We5tBjjq/rapidpacknship_live_db.sql | 351692 |
| TransferNow-20261030We5tBjjq/api (1)/PHPMailer | 242876 |
| TransferNow-20261030We5tBjjq/rpns.sql | 28808 |
| TransferNow-20261030We5tBjjq/api (1)/error_log | 21071 |
| TransferNow-20261030We5tBjjq/api (1)/index.php | 10807 |
| TransferNow-20261030We5tBjjq/api (1)/.DS_Store | 10244 |
| TransferNow-20261030We5tBjjq/.DS_Store | 8196 |
| TransferNow-20261030We5tBjjq/api (1)/test.php | 7960 |
| TransferNow-20261030We5tBjjq/api (1)/sitemap.xml | 2185 |
| TransferNow-20261030We5tBjjq/api (1)/.htaccess | 211 |
| TransferNow-20261030We5tBjjq/api (1)/robots.txt | 30 |

## Project interpretation

- `application` + `system` + root `index.php`: primary CodeIgniter candidate. `system/core/CodeIgniter.php` declares **3.1.10**. Production-active location cannot be established without deployed webroot/configuration.
- `bkp_application_7apr`: older application backup, not automatically authoritative.
- `html-backup`: HTML/PHP/media backup; useful comparison material, not proof of live content.
- `api`: standalone invoice/warehouse API, AWS SDK, PDF tooling and backups; separate operational subsystem.
- `assets`: public styling and media mixed with user/signup uploads and vendor samples. Never publish this whole tree blindly.
- `PHPMailer`, SDK libraries, root operational video/PDF manuals: supporting material, not marketing content.
- Both SQL exports are at the transfer folder root. There are no additional loose `.sql` files in this source inventory. All ZIP central-directory listings were inspected; none adds a different SQL export beyond the outer transfer's two members. Nested archive members were not recursively decompressed.

## Archives

No extraction was needed. The outer transfer ZIP contains the two dumps and `api (1).zip`; corresponding loose/extracted files already exist. Duplicate structure was established from listings, not a claim of byte-for-byte identity. Assets ZIPs and vendor ZIPs overlap existing directories. Archive totals below are metadata, not validated decompression sizes. Never trust paths or executable content when later extracting.

| Archive relative to source | Entries | Uncompressed bytes | SQL members |
| --- | --- | --- | --- |
| TransferNow-20261030We5tBjjq.zip | 3 | 1689380638 | rpns.sql, rapidpacknship_live_db.sql |
| TransferNow-20261030We5tBjjq/api (1).zip | 16322 | 1833226629 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets.zip | 13470 | 790106865 | none |
| TransferNow-20261030We5tBjjq/api (1)/html-backup/tcpdf.zip | 225 | 26870338 | none |
| TransferNow-20261030We5tBjjq/api (1)/html-backup/PHPMailer.zip | 4 | 242876 | none |
| TransferNow-20261030We5tBjjq/api (1)/bkp_application_7apr/libraries/stripe-sdk.zip | 137 | 504265 | none |
| TransferNow-20261030We5tBjjq/api (1)/api/bkp.zip | 27 | 9418811 | none |
| TransferNow-20261030We5tBjjq/api (1)/api/Aws.zip | 5169 | 58144816 | none |
| TransferNow-20261030We5tBjjq/api (1)/application/views.zip | 638 | 1840394 | none |
| TransferNow-20261030We5tBjjq/api (1)/application/libraries/stripe-sdk.zip | 137 | 504265 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/front_assets.zip | 510 | 51381891 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/dashboard/css/fontawesome5/font-awesomejs.zip | 2 | 18328 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/dashboard/js/fontawesome5/font-awesomejs.zip | 2 | 18328 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/front_assets/plugins/bootstrap-tagsinput/bootstrap-tagsinput.zip | 8 | 115377 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/gamma-gallery.zip | 46 | 1714709 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor.zip | 593 | 3951346 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/bootstrap-datetimepicker1.zip | 6 | 72786 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/floatpanel_4.5.7.zip | 1 | 19191 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/panelbutton_4.5.7.zip | 1 | 3146 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/panel_4.5.7.zip | 1 | 10516 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/colordialog_4.5.7.zip | 71 | 34833 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/dialog_4.5.7.zip | 6 | 138867 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/button_4.5.7.zip | 47 | 22354 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/colorbutton_4.5.7(1).zip | 75 | 108123 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor-old/plugins/dialogui_4.5.7.zip | 1 | 52136 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/floatpanel_4.5.7.zip | 1 | 19191 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/panelbutton_4.5.7.zip | 1 | 3146 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/pastetools_4.14.0.zip | 4 | 38988 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/panel_4.5.7.zip | 1 | 10516 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/colordialog_4.5.7.zip | 71 | 34833 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/dialog_4.5.7.zip | 6 | 138867 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/button_4.5.7.zip | 47 | 22354 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/colorbutton_4.5.7(1).zip | 75 | 108123 | none |
| TransferNow-20261030We5tBjjq/api (1)/assets/global/plugins/ckeditor/plugins/dialogui_4.5.7.zip | 1 | 52136 | none |

## Compatibility

The main project has no root Composer dependency manifest or enforceable application-wide PHP requirement. CI 3.1.10 is an old framework; inspect runtime compatibility rather than infer it from the export tool. SQL dump header reports MariaDB 10.11.19 and PHP 8.4.27, which describes the export environment, not proof the app runs correctly on PHP 8.4. Short PHP tags, legacy SDKs, procedural database APIs and PHP view helpers complicate direct runtime reuse. Rebuild behavior in FastAPI rather than deploying the backup unchanged.

Configuration/database files, private uploads, logs, certificates/key-like files and backups exist. No secret values or private records are included here. No source files were moved, changed or copied to the repository.

## Template provenance comparison

Compared matching PHP files in frontend/views against application/views using in-memory SHA-256 digests (no digest values published): 263 identical, 0 different. Matching files establish copied-template provenance, not live deployment status.
