import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, toast } from "@medusajs/ui"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import ReactMarkdown from "react-markdown"
import { useState, useCallback, useEffect, useRef } from "react"

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
/* Toolbar buttons */
.mde-btn {
    display:inline-flex; align-items:center; justify-content:center;
    min-width:30px; height:30px; padding:0 7px; border-radius:6px;
    font-size:12.5px; font-weight:600; cursor:pointer; user-select:none;
    border:1px solid transparent; background:transparent;
    color:var(--fg-subtle,#6b7280); transition:all 0.12s;
    font-family:ui-monospace,monospace; line-height:1;
}
.mde-btn:hover { background:var(--bg-hover,#f3f4f6); color:var(--fg-base,#111827); border-color:var(--border-base,#e5e7eb); }
.mde-btn.is-active { background:#ede9fe; color:#6d28d9; border-color:#c4b5fd; }
.mde-sep { width:1px; height:22px; background:var(--border-base,#e5e7eb); margin:0 4px; align-self:center; flex-shrink:0; }

/* Editor area */
.mde-editor-wrap {
    border:1px solid var(--border-base,#e5e7eb);
    border-radius:8px; overflow:hidden;
    transition:border-color 0.15s, box-shadow 0.15s;
    background:var(--bg-field,#fff);
}
.mde-editor-wrap:focus-within {
    border-color:#818cf8;
    box-shadow:0 0 0 2px rgba(129,140,248,0.15);
}
.ProseMirror {
    min-height:200px; max-height:480px; overflow-y:auto;
    padding:12px 14px; outline:none;
    font-size:14px; line-height:1.75;
    color:var(--fg-base,#111827);
}
.ProseMirror p { margin:0.3rem 0; }
.ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color:#9ca3af; pointer-events:none; float:left; height:0;
}
.ProseMirror h1 { font-size:1.5rem; font-weight:700; margin:1rem 0 0.4rem; line-height:1.3; }
.ProseMirror h2 { font-size:1.2rem; font-weight:700; margin:0.9rem 0 0.35rem; line-height:1.35; }
.ProseMirror h3 { font-size:1.05rem; font-weight:600; margin:0.75rem 0 0.3rem; }
.ProseMirror strong { font-weight:700; }
.ProseMirror em { font-style:italic; }
.ProseMirror s { text-decoration:line-through; color:#9ca3af; }
.ProseMirror ul  { list-style-type:disc !important;    padding-left:1.6rem; margin:0.3rem 0; }
.ProseMirror ol  { list-style-type:decimal !important; padding-left:1.6rem; margin:0.3rem 0; }
.ProseMirror li  { display:list-item !important; margin:0.15rem 0; }
.ProseMirror ul ul  { list-style-type:circle !important; }
.ProseMirror ul ul ul { list-style-type:square !important; }
.ProseMirror code { font-family:monospace; font-size:0.82em; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:4px; padding:1px 5px; }
.ProseMirror pre { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:10px 14px; margin:0.5rem 0; overflow-x:auto; }
.ProseMirror pre code { background:none; border:none; padding:0; font-size:0.875rem; }
.ProseMirror blockquote { border-left:3px solid #9ca3af; padding:3px 12px; margin:0.4rem 0; color:#6b7280; }
.ProseMirror hr { border:none; border-top:1px solid #e5e7eb; margin:0.75rem 0; }

/* Preview */
.md-preview h1 { font-size:1.35rem; font-weight:700; margin:.9rem 0 .4rem; padding-bottom:4px; border-bottom:1px solid var(--border-base,#e5e7eb); }
.md-preview h2 { font-size:1.1rem; font-weight:600; margin:.9rem 0 .35rem; padding-bottom:3px; border-bottom:1px solid var(--border-base,#e5e7eb); }
.md-preview h3 { font-size:.97rem; font-weight:600; margin:.75rem 0 .25rem; }
.md-preview p { margin:.35rem 0; color:var(--fg-subtle,#374151); }
.md-preview ul  { list-style-type:disc !important;    margin:.35rem 0 .35rem 1.5rem; }
.md-preview ol  { list-style-type:decimal !important; margin:.35rem 0 .35rem 1.5rem; }
.md-preview li  { display:list-item !important; margin:.1rem 0; color:var(--fg-subtle,#374151); }
.md-preview ul ul  { list-style-type:circle !important; }
.md-preview ul ul ul { list-style-type:square !important; }
.md-preview strong { font-weight:600; }
.md-preview em { font-style:italic; }
.md-preview del { text-decoration:line-through; color:#9ca3af; }
.md-preview code { font-family:monospace; font-size:.82em; background:var(--bg-subtle,#f3f4f6); border:1px solid #e5e7eb; border-radius:4px; padding:1px 5px; }
.md-preview pre { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:10px 12px; overflow-x:auto; margin:.4rem 0; }
.md-preview pre code { background:none; border:none; padding:0; font-size:.875rem; }
.md-preview blockquote { border-left:3px solid #9ca3af; margin:.4rem 0; padding:3px 10px; color:#6b7280; }
.md-preview hr { border:none; border-top:1px solid #e5e7eb; margin:.6rem 0; }
.md-preview a { color:#6366f1; text-decoration:underline; }
.md-preview table { width:100%; border-collapse:collapse; font-size:.875rem; margin:.4rem 0; }
.md-preview th,.md-preview td { border:1px solid #e5e7eb; padding:5px 9px; }
.md-preview th { background:#f9fafb; font-weight:600; }
`

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const Btn = ({
    label, title, active, onMouseDown, style
}: {
    label: string; title: string; active?: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    style?: React.CSSProperties;
}) => (
    <button
        className={`mde-btn${active ? " is-active" : ""}`}
        title={title}
        onMouseDown={onMouseDown}
        style={style}
    >
        {label}
    </button>
)

const Sep = () => <span className="mde-sep" />

// ─── Widget ───────────────────────────────────────────────────────────────────
const ProductDescriptionMarkdownWidget = ({ data }: { data: any }) => {
    const [tab, setTab] = useState<"edit" | "preview">("edit")
    const [saving, setSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const [previewMd, setPreviewMd] = useState<string>(data?.description ?? "")
    // Tracks what was last saved by US — used to ignore the stale cached prop
    // after a successful save (the Medusa prop doesn't refresh immediately)
    const lastSavedRef = useRef<string>(data?.description ?? "")
    // Incrementing this on every selection change forces React to re-evaluate
    // all editor.isActive() calls in the toolbar so active states stay accurate
    const [, setSelectionVersion] = useState(0)

    // Inject styles once
    useEffect(() => {
        if (document.getElementById("mde-tiptap-styles")) return
        const el = document.createElement("style")
        el.id = "mde-tiptap-styles"
        el.textContent = CSS
        document.head.appendChild(el)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Markdown.configure({ html: false, transformPastedText: true }),
        ],
        content: data?.description ?? "",
        // Re-render toolbar whenever content changes
        onUpdate({ editor }) {
            setDirty(true)
            setPreviewMd((editor.storage as any).markdown.getMarkdown())
            setSelectionVersion(v => v + 1)
        },
        // Re-render toolbar whenever cursor moves or selection changes
        onSelectionUpdate() {
            setSelectionVersion(v => v + 1)
        },
    })

    // Sync only if data.description changed from OUTSIDE (not from our own save).
    // We detect this by comparing against lastSavedRef — if data.description
    // matches what we last saved, it's just the stale cache; ignore it.
    useEffect(() => {
        if (!editor) return
        const incoming = data?.description ?? ""
        // Genuine external change: prop differs from what we last saved
        if (incoming !== lastSavedRef.current) {
            lastSavedRef.current = incoming
            if (!dirty) {
                editor.commands.setContent(incoming)
                setPreviewMd(incoming)
            }
        }
    }, [data?.description])

    const cmd = useCallback((fn: () => void) => (e: React.MouseEvent) => {
        e.preventDefault()
        fn()
        editor?.commands.focus()
    }, [editor])

    const handleSave = useCallback(async () => {
        if (!editor || !data?.id || !dirty) return
        const md = (editor.storage as any).markdown.getMarkdown()
        setSaving(true)
        try {
            const res = await fetch(`/admin/products/${data.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ description: md }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            // Record what we saved so the sync effect won't revert us
            // when the stale cached `data.description` prop triggers a re-render
            lastSavedRef.current = md
            setDirty(false)
            setPreviewMd(md)
            toast.success("Saved", { description: "Description updated successfully." })
        } catch {
            toast.error("Save failed", { description: "Could not update description. Please try again." })
        } finally {
            setSaving(false)
        }
    }, [editor, data?.id, dirty])

    if (!data) return null

    return (
        <Container className="divide-y p-0">
            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Heading level="h2">Description</Heading>
                    {dirty && (
                        <span style={{
                            fontSize: 11, fontWeight: 600, color: "#d97706",
                            background: "#fffbeb", border: "1px solid #fcd34d",
                            borderRadius: 9999, padding: "2px 8px",
                        }}>Unsaved changes</span>
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        display: "flex", background: "var(--bg-subtle,#f3f4f6)",
                        borderRadius: 8, padding: 3, gap: 2,
                        border: "1px solid var(--border-base,#e5e7eb)",
                    }}>
                        {([
                            {
                                key: "edit" as const,
                                label: "Edit",
                                icon: (
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                        <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 2.474L4.62 12.77a2.25 2.25 0 0 1-.999.58l-2.659.72a.25.25 0 0 1-.31-.31l.72-2.66a2.25 2.25 0 0 1 .58-.998l8.86-8.675Zm1.414 1.06a.25.25 0 0 0-.354 0L3.217 11.353a.75.75 0 0 0-.193.333l-.479 1.767 1.767-.479a.75.75 0 0 0 .333-.193l8.86-8.86a.25.25 0 0 0 0-.354l-1.078-1.08Z" fill="currentColor" />
                                    </svg>
                                )
                            },
                            {
                                key: "preview" as const,
                                label: "Preview",
                                icon: (
                                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                        <path d="M8 2C4.5 2 1.5 5 1.5 8s3 6 6.5 6 6.5-3 6.5-6S11.5 2 8 2Zm0 10.5A4.5 4.5 0 1 1 8 3.5a4.5 4.5 0 0 1 0 9ZM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" fill="currentColor" />
                                    </svg>
                                )
                            }
                        ]).map(({ key, label, icon }) => (
                            <button key={key} onClick={() => setTab(key)} style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                                border: "none", cursor: "pointer", transition: "all 0.15s",
                                background: tab === key ? "#fff" : "transparent",
                                color: tab === key ? "var(--fg-base,#111827)" : "var(--fg-muted,#9ca3af)",
                                boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            }}>
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Edit Tab ── */}
            {tab === "edit" && (
                <div style={{ padding: "10px 24px 16px" }}>
                    <div className="mde-editor-wrap">
                        {/* Toolbar */}
                        <div style={{
                            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2,
                            padding: "6px 8px",
                            borderBottom: "1px solid var(--border-base,#e5e7eb)",
                            background: "var(--bg-subtle,#f9fafb)",
                        }}>
                            <Btn label="H1" title="Heading 1"
                                active={editor?.isActive("heading", { level: 1 })}
                                onMouseDown={cmd(() => editor?.chain().toggleHeading({ level: 1 }).run())}
                            />
                            <Btn label="H2" title="Heading 2"
                                active={editor?.isActive("heading", { level: 2 })}
                                onMouseDown={cmd(() => editor?.chain().toggleHeading({ level: 2 }).run())}
                            />
                            <Btn label="H3" title="Heading 3"
                                active={editor?.isActive("heading", { level: 3 })}
                                onMouseDown={cmd(() => editor?.chain().toggleHeading({ level: 3 }).run())}
                            />
                            <Sep />
                            <Btn label="B" title="Bold" style={{ fontWeight: 800 }}
                                active={editor?.isActive("bold")}
                                onMouseDown={cmd(() => editor?.chain().toggleBold().run())}
                            />
                            <Btn label="I" title="Italic" style={{ fontStyle: "italic" }}
                                active={editor?.isActive("italic")}
                                onMouseDown={cmd(() => editor?.chain().toggleItalic().run())}
                            />
                            <Btn label="S" title="Strikethrough" style={{ textDecoration: "line-through" }}
                                active={editor?.isActive("strike")}
                                onMouseDown={cmd(() => editor?.chain().toggleStrike().run())}
                            />
                            <Btn label="`" title="Inline Code"
                                active={editor?.isActive("code")}
                                onMouseDown={cmd(() => editor?.chain().toggleCode().run())}
                            />
                            <Sep />
                            <Btn label="•" title="Bullet List"
                                active={editor?.isActive("bulletList")}
                                onMouseDown={cmd(() => editor?.chain().toggleBulletList().run())}
                            />
                            <Btn label="1." title="Numbered List"
                                active={editor?.isActive("orderedList")}
                                onMouseDown={cmd(() => editor?.chain().toggleOrderedList().run())}
                            />
                            <Btn label="❝" title="Blockquote"
                                active={editor?.isActive("blockquote")}
                                onMouseDown={cmd(() => editor?.chain().toggleBlockquote().run())}
                            />
                            <Sep />
                            <Btn label="{ }" title="Code Block"
                                active={editor?.isActive("codeBlock")}
                                onMouseDown={cmd(() => editor?.chain().toggleCodeBlock().run())}
                            />
                            <Btn label="—" title="Horizontal Rule"
                                onMouseDown={cmd(() => editor?.chain().setHorizontalRule().run())}
                            />
                            <Sep />
                            <Btn label="↩" title="Undo"
                                onMouseDown={cmd(() => editor?.chain().undo().run())}
                            />
                            <Btn label="↪" title="Redo"
                                onMouseDown={cmd(() => editor?.chain().redo().run())}
                            />
                        </div>

                        {/* The WYSIWYG editor */}
                        <EditorContent editor={editor} />
                    </div>

                    {/* Save bar */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <button
                            onClick={handleSave}
                            disabled={!dirty || saving}
                            style={{
                                padding: "6px 20px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                                border: "none", cursor: dirty && !saving ? "pointer" : "not-allowed",
                                background: dirty && !saving ? "#6d28d9" : "#e5e7eb",
                                color: dirty && !saving ? "#fff" : "#9ca3af",
                                transition: "all 0.15s",
                                boxShadow: dirty && !saving ? "0 2px 6px rgba(109,40,217,0.3)" : "none",
                            }}
                        >
                            {saving ? "Saving…" : "Save Description"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Preview Tab ── */}
            {tab === "preview" && (
                <div style={{ padding: "12px 24px", fontSize: 14, lineHeight: "1.75" }}>
                    {previewMd ? (
                        <div className="md-preview">
                            <ReactMarkdown>{previewMd}</ReactMarkdown>
                        </div>
                    ) : (
                        <p style={{ color: "#9ca3af", fontStyle: "italic" }}>No description yet.</p>
                    )}
                </div>
            )}
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.before",
})

export default ProductDescriptionMarkdownWidget
