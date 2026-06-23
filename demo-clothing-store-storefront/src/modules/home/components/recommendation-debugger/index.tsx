"use client"

/**
 * RecommendationDebugger — floating dev-only panel for diagnosing AI recommendations.
 *
 * Only rendered when NEXT_PUBLIC_REC_DEBUG=true in .env.local
 * Never ships in production (the parent component also guards on the same env var).
 *
 * Shows:
 *  - Identity: session_id, fingerprint_id, customer_id (prop vs auto-fetched vs used)
 *  - Request: full query URL sent to the backend
 *  - Response: strategy chosen, product count, recomm_id, timing
 *  - Notes: step-by-step explanation of what the backend decided
 *  - Raw JSON: collapsible full response
 */

import { useState } from "react"
import { RecommendationDebugInfo } from "@hooks/use-recommendations"

type Props = {
    debug: RecommendationDebugInfo | null
    loading: boolean
    error: string | null
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span
            style={{
                display:        "inline-block",
                padding:        "2px 8px",
                borderRadius:   "9999px",
                fontSize:       "11px",
                fontWeight:     700,
                background:     color === "green"  ? "#dcfce7" :
                                color === "yellow" ? "#fef9c3" :
                                color === "red"    ? "#fee2e2" :
                                color === "blue"   ? "#dbeafe" : "#f1f5f9",
                color:          color === "green"  ? "#16a34a" :
                                color === "yellow" ? "#a16207" :
                                color === "red"    ? "#dc2626" :
                                color === "blue"   ? "#2563eb" : "#475569",
                letterSpacing:  "0.03em",
            }}
        >
            {children}
        </span>
    )
}

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "4px" }}>
            <span style={{ color: "#94a3b8", fontSize: "11px", minWidth: "130px", flexShrink: 0 }}>
                {label}
            </span>
            <span style={{
                color:      "#e2e8f0",
                fontSize:   "11px",
                fontFamily: mono ? "monospace" : "inherit",
                wordBreak:  "break-all",
                flex:       1,
            }}>
                {value ?? <span style={{ color: "#64748b" }}>—</span>}
            </span>
        </div>
    )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text).then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                })
            }}
            style={{
                background: copied ? "#16a34a" : "#334155",
                border:      "none",
                borderRadius: "4px",
                color:       "#e2e8f0",
                fontSize:    "10px",
                padding:     "2px 7px",
                cursor:      "pointer",
                fontFamily:  "monospace",
                flexShrink:  0,
            }}
        >
            {copied ? "✓ copied" : "copy"}
        </button>
    )
}

const STRATEGY_COLOR: Record<string, string> = {
    personalised:    "green",
    mixed:           "yellow",
    trending:        "yellow",
    bought_together: "blue",
    error:           "red",
}

export default function RecommendationDebugger({ debug, loading, error }: Props) {
    const [open,    setOpen]    = useState(true)
    const [rawOpen, setRawOpen] = useState(false)

    const strategyColor = debug ? (STRATEGY_COLOR[debug.strategy_returned] ?? "blue") : "blue"

    return (
        <div
            id="rec-debugger"
            style={{
                position:     "fixed",
                bottom:       "24px",
                right:        "24px",
                zIndex:       9999,
                width:        open ? "420px" : "auto",
                maxHeight:    open ? "90vh" : "auto",
                overflowY:    "auto",
                background:   "#0f172a",
                border:       "1px solid #1e293b",
                borderRadius: "12px",
                boxShadow:    "0 8px 32px rgba(0,0,0,0.5)",
                fontFamily:   "system-ui, -apple-system, sans-serif",
                fontSize:     "12px",
            }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div
                onClick={() => setOpen((v) => !v)}
                style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    padding:        "10px 14px",
                    cursor:         "pointer",
                    borderBottom:   open ? "1px solid #1e293b" : "none",
                    background:     "#0f172a",
                    borderRadius:   open ? "12px 12px 0 0" : "12px",
                    userSelect:     "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>🤖</span>
                    <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "12px" }}>
                        AI Rec Debugger
                    </span>
                    {!loading && debug && (
                        <Badge color={strategyColor}>
                            {debug.strategy_returned || "—"}
                        </Badge>
                    )}
                    {loading && (
                        <Badge color="blue">loading…</Badge>
                    )}
                    {error && (
                        <Badge color="red">error</Badge>
                    )}
                </div>
                <span style={{ color: "#475569", fontSize: "14px" }}>
                    {open ? "▼" : "▲"}
                </span>
            </div>

            {!open ? null : loading ? (
                <div style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", textAlign: "center" }}>
                    ⏳ Fetching recommendations…
                </div>
            ) : error ? (
                <div style={{ padding: "16px" }}>
                    <div style={{ color: "#f87171", fontSize: "12px", fontFamily: "monospace" }}>
                        ❌ {error}
                    </div>
                </div>
            ) : debug ? (
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* ── Notes (explanation) ────────────────────────────── */}
                    <div>
                        <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                            What happened
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            {debug.notes.map((note, i) => (
                                <div key={i} style={{
                                    color:      note.startsWith("✅") ? "#86efac" :
                                                note.startsWith("⚠️") ? "#fde68a" :
                                                note.startsWith("❌") ? "#f87171" :
                                                note.startsWith("🎯") ? "#6ee7b7" :
                                                note.startsWith("   ") ? "#64748b" : "#cbd5e1",
                                    fontSize:   "11px",
                                    lineHeight: "1.5",
                                    fontFamily: note.startsWith("   ") ? "monospace" : "inherit",
                                }}>
                                    {note}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: "1px", background: "#1e293b" }} />

                    {/* ── Identity ───────────────────────────────────────── */}
                    <div>
                        <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                            Identity
                        </div>
                        <Row label="customer_id (prop)"
                             value={debug.customer_id_prop
                                ? <span style={{ color: "#86efac" }}>{debug.customer_id_prop}</span>
                                : <span style={{ color: "#64748b" }}>not passed</span>}
                        />
                        <Row label="customer_id (auto)"
                             value={debug.customer_id_auto
                                ? <span style={{ color: "#86efac" }}>{debug.customer_id_auto}</span>
                                : <span style={{ color: "#fde68a" }}>null (guest or fetch failed)</span>}
                        />
                        <Row label="customer_id (sent)"
                             value={debug.customer_id_used
                                ? <span style={{ color: "#6ee7b7" }}>{debug.customer_id_used}</span>
                                : <span style={{ color: "#f87171" }}>❌ NOT SENT — events queried by session only</span>}
                        />
                        <Row label="session_id"    value={debug.session_id} />
                        <Row label="fingerprint_id" value={debug.fingerprint_id} />
                    </div>

                    <div style={{ height: "1px", background: "#1e293b" }} />

                    {/* ── Request ────────────────────────────────────────── */}
                    <div>
                        <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                            Request
                        </div>
                        <Row label="type requested"  value={debug.requested_type} />
                        <Row label="limit requested" value={String(debug.requested_limit)} />
                        <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <span style={{ color: "#94a3b8", fontSize: "11px", minWidth: "130px", flexShrink: 0 }}>
                                query URL
                            </span>
                            <div style={{ flex: 1, display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                <span style={{
                                    color:      "#e2e8f0",
                                    fontSize:   "10px",
                                    fontFamily: "monospace",
                                    wordBreak:  "break-all",
                                    flex:       1,
                                    background: "#1e293b",
                                    padding:    "4px 6px",
                                    borderRadius: "4px",
                                }}>
                                    {debug.query_url}
                                </span>
                                <CopyButton text={debug.query_url} />
                            </div>
                        </div>
                    </div>

                    <div style={{ height: "1px", background: "#1e293b" }} />

                    {/* ── Response ───────────────────────────────────────── */}
                    <div>
                        <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                            Response
                        </div>
                        <Row label="strategy"
                             value={
                                <Badge color={strategyColor}>
                                    {debug.strategy_returned}
                                </Badge>
                             }
                             mono={false}
                        />
                        <Row label="products count"  value={String(debug.products_count)} />
                        <Row label="recomm_id"        value={debug.recomm_id} />
                        <Row label="fetch time"       value={`${debug.fetch_ms}ms`} />
                    </div>

                    {/* ── Raw JSON ───────────────────────────────────────── */}
                    <div>
                        <button
                            onClick={() => setRawOpen((v) => !v)}
                            style={{
                                background:   "#1e293b",
                                border:       "none",
                                color:        "#94a3b8",
                                fontSize:     "10px",
                                fontWeight:   700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                padding:      "4px 8px",
                                borderRadius: "4px",
                                cursor:       "pointer",
                                width:        "100%",
                                textAlign:    "left",
                                display:      "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Raw JSON response</span>
                            <span>{rawOpen ? "▲ hide" : "▼ show"}</span>
                        </button>
                        {rawOpen && (
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <div style={{ position: "absolute", top: "6px", right: "6px" }}>
                                    <CopyButton text={JSON.stringify(debug.raw_response, null, 2)} />
                                </div>
                                <pre style={{
                                    background:  "#1e293b",
                                    color:       "#94a3b8",
                                    fontSize:    "10px",
                                    padding:     "10px",
                                    borderRadius: "6px",
                                    overflow:    "auto",
                                    maxHeight:   "200px",
                                    margin:       0,
                                }}>
                                    {JSON.stringify(debug.raw_response, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* ── Quick actions ──────────────────────────────────── */}
                    <div style={{ height: "1px", background: "#1e293b" }} />
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background:   "#1e293b",
                                border:       "1px solid #334155",
                                color:        "#cbd5e1",
                                fontSize:     "10px",
                                padding:      "4px 10px",
                                borderRadius: "6px",
                                cursor:       "pointer",
                            }}
                        >
                            🔄 Reload page
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("rec_session_id")
                                localStorage.removeItem("rec_fingerprint_id")
                                window.location.reload()
                            }}
                            style={{
                                background:   "#1e293b",
                                border:       "1px solid #334155",
                                color:        "#fde68a",
                                fontSize:     "10px",
                                padding:      "4px 10px",
                                borderRadius: "6px",
                                cursor:       "pointer",
                            }}
                        >
                            🗑️ Reset identity
                        </button>
                        <button
                            onClick={async () => {
                                const btn = document.getElementById("debug-merge-btn");
                                if (btn) btn.innerText = "⏳ Merging...";
                                try {
                                    await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/recommendations/merge`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
                                                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
                                            })
                                        },
                                        body: JSON.stringify({
                                            customer_id: debug.customer_id_used,
                                            session_id: debug.session_id,
                                            fingerprint_id: debug.fingerprint_id
                                        })
                                    });
                                    if (btn) btn.innerText = "✅ Merged!";
                                    setTimeout(() => window.location.reload(), 1000);
                                } catch {
                                    if (btn) btn.innerText = "❌ Failed";
                                }
                            }}
                            id="debug-merge-btn"
                            disabled={!debug.customer_id_used}
                            style={{
                                background:   "#1e293b",
                                border:       "1px solid #334155",
                                color:        debug.customer_id_used ? "#86efac" : "#64748b",
                                fontSize:     "10px",
                                padding:      "4px 10px",
                                borderRadius: "6px",
                                cursor:       debug.customer_id_used ? "pointer" : "not-allowed",
                            }}
                        >
                            🔗 Trigger Merge
                        </button>
                    </div>

                    <div style={{ color: "#334155", fontSize: "10px", textAlign: "center" }}>
                        NEXT_PUBLIC_REC_DEBUG=true · disable in .env.local to hide
                    </div>
                </div>
            ) : (
                <div style={{ padding: "16px", color: "#64748b", fontSize: "12px", textAlign: "center" }}>
                    No debug data yet
                </div>
            )}
        </div>
    )
}
