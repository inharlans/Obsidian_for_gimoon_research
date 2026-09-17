// PaperKG Zotero attachment safety profile.
// Copy this file to the active Zotero profile as user.js while Zotero is closed.
// The Zotero database remains in C:\\Users\\user\\Zotero and must never be placed in Google Drive.

// Zotero resolves relative linked-file paths against a stable local root. Google
// Drive is an add-only replica and is never required to open a PDF in Zotero.
user_pref("extensions.zotero.baseAttachmentPath", "C:\\Users\\user\\Documents\\PaperKG-Zotero-Attachments");
user_pref("extensions.zotero.saveRelativeAttachmentPath", true);

// Zotero 7+ file-handling defaults from the current Attanger workflow.
// The filename template itself is a synced Zotero library setting and is set
// through Settings > General > Configure File Renaming.
user_pref("extensions.zotero.autoRenameFiles", true);
user_pref("extensions.zotero.autoRenameFiles.linked", false);
user_pref("extensions.zotero.autoRenameFiles.fileTypes", "application/pdf,application/epub+zip");
user_pref("extensions.zotero.automaticSnapshots", false);

user_pref("extensions.zotero.zoteroattanger.enable", true);
user_pref("extensions.zotero.zoteroattanger.attachType", "linking");
user_pref("extensions.zotero.zoteroattanger.destDir", "C:\\Users\\user\\Documents\\PaperKG-Zotero-Attachments");
user_pref("extensions.zotero.zoteroattanger.sourceDir", "");
user_pref("extensions.zotero.zoteroattanger.subfolderFormat", "");
user_pref("extensions.zotero.zoteroattanger.slashAsSubfolderDelimiter", false);

// New attachments are renamed and moved into the stable local folder. The
// external hidden guard copies missing immutable PDFs to Google Drive.
user_pref("extensions.zotero.zoteroattanger.autoMove", true);
user_pref("extensions.zotero.zoteroattanger.autoRenameOnModify", false);
user_pref("extensions.zotero.zoteroattanger.autoRemoveEmptyFolder", false);
// The one-item copy test and the complete 40-file migration are verified.
// Future Attanger operations move into the stable linked-PDF root instead of
// leaving unmanaged source copies.
user_pref("extensions.zotero.zoteroattanger.moveWithoutDeleting", false);
user_pref("extensions.zotero.zoteroattanger.syncAttachmentTitle", false);
// Explicit one-item migration shortcut. Ctrl+Shift+R invokes Attanger's
// Rename and Move/Copy action without conflicting with Zotero defaults.
user_pref("extensions.zotero.zoteroattanger.renameMoveAttachment.shortcut.enable", true);
user_pref("extensions.zotero.zoteroattanger.renameMoveAttachment.shortcut", "Ctrl + Shift + R");

// Keep Better BibTeX exports aligned with Zotero's linked attachment base.
user_pref("extensions.zotero.translators.better-bibtex.baseAttachmentPath", "C:\\Users\\user\\Documents\\PaperKG-Zotero-Attachments");
