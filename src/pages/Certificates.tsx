import React, { useState, useEffect } from 'react';
import {
  Medal,
  Download,
  CheckCircle2,
  Search,
  ShieldCheck,
  Printer,
  QrCode,
  Sparkles,
  Award,
  Calendar,
  Building2,
  Check,
  ExternalLink,
  Copy,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { BotanicalShapes } from '../components/ui/BotanicalShapes';

export const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates');
        if (res.data.success) {
          setCertificates(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;

    try {
      const res = await api.get(`/certificates/verify/${encodeURIComponent(verifyCode.trim())}`);
      setVerifyResult(res.data);
    } catch (err: any) {
      setVerifyResult({ success: false, message: 'Invalid or unverified certificate code' });
    }
  };

  const handleCopyVerification = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading Certificate Repository...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-xs font-sans">
      {/* Standardized Teal Page Header */}
      <PageHeader
        title="Certificates & Verified Credentials"
        description="Official enterprise credentials awarded upon successful completion of competency benchmarks and training curricula."
        badgeText="Verified Credentials"
      />

      {/* Verification Lookup Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden">
        <BotanicalShapes variant="card-corner" opacity={0.25} />
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Public Certificate Verification & Authenticity Engine</span>
        </h3>
        <p className="text-slate-500 text-xs">
          Validate any OKGIP cryptographic credential code or certificate serial number against our ledger.
        </p>
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="e.g. VER-88392-CLOUD or OKGIP-CERT-2026-001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-mono font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Authenticity</span>
          </button>
        </form>

        {verifyResult && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold border ${
              verifyResult.success
                ? 'bg-teal-50 text-teal-900 border-teal-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {verifyResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              )}
              <span>{verifyResult.message}</span>
            </div>
            {verifyResult.data && (
              <div className="mt-2 text-[11px] font-medium text-slate-700 pl-6 space-y-0.5">
                <p>
                  Recipient: <strong className="text-slate-900">{verifyResult.data.employee_name}</strong>
                </p>
                <p>
                  Program: <strong className="text-slate-900">{verifyResult.data.program_title}</strong>
                </p>
                <p>
                  Issue Date: <strong className="text-slate-900">{verifyResult.data.issued_date}</strong>
                </p>
                <p className="text-teal-700 font-mono text-[10px]">
                  Credential Hash: {verifyResult.data.verification_code}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No certificates earned yet. Complete assigned training programs to generate verified credentials!
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              <BotanicalShapes variant="card-corner" opacity={0.2} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>OKGIP Certified</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{cert.issued_date}</span>
                </div>

                <h3 className="font-black text-base text-slate-900 leading-snug group-hover:text-teal-800 transition-colors">
                  {cert.program_title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-2">
                  Awarded to: <strong className="text-slate-900">{cert.employee_name}</strong>
                </p>

                <div className="mt-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cert #:</span>
                    <span className="font-bold text-slate-800">{cert.cert_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Code:</span>
                    <span className="font-bold text-teal-700">{cert.verification_code}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(cert)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Official Certificate</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Realistic Official Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-4xl w-full p-8 md:p-12 space-y-6 border-8 border-double border-[#C9A84C] shadow-2xl relative text-center text-slate-900 my-auto">
            {/* Top Close Button (Hidden during print) */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer print:hidden transition-all"
            >
              ✕
            </button>

            {/* Guilloche / Elegant Corner Accents */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#C9A84C] pointer-events-none" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#C9A84C] pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#C9A84C] pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#C9A84C] pointer-events-none" />

            {/* Inner Border Frame */}
            <div className="border border-[#C9A84C]/50 p-6 md:p-10 rounded-2xl relative bg-white/70 shadow-inner">
              {/* Header with Gold Foil Seal */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#9B7A27] via-[#D4AF37] to-[#F3E5AB] text-slate-900 flex items-center justify-center shadow-lg border-2 border-[#9B7A27] mb-3 relative">
                  <Award className="w-10 h-10 text-white drop-shadow" />
                  <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#17324D] text-[#D4AF37] text-[9px] font-black uppercase tracking-wider border border-[#D4AF37]">
                    SEAL
                  </div>
                </div>

                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9B7A27] font-serif">
                  ORGANIZATIONAL KNOWLEDGE GAP INTELLIGENCE PLATFORM
                </p>
                <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-slate-900 mt-2">
                  Certificate of Excellence
                </h1>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">
                  OFFICIALLY ACCREDITED ENTERPRISE COMPETENCY CREDENTIAL
                </p>
              </div>

              {/* Recipient Details */}
              <div className="py-6 space-y-3">
                <p className="text-xs text-slate-600 font-serif italic">This is proudly awarded and certified to</p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#17324D] underline decoration-[#D4AF37] decoration-2 underline-offset-8">
                  {selectedCert.employee_name}
                </h2>
                <p className="text-xs text-slate-600 font-serif max-w-xl mx-auto pt-4 leading-relaxed">
                  for demonstrating outstanding subject mastery, practical proficiency, and successfully completing the certified enterprise curriculum in
                </p>
                <div className="text-lg md:text-xl font-bold text-teal-800 bg-teal-50/80 border border-teal-200 py-2.5 px-6 rounded-xl max-w-lg mx-auto shadow-2xs font-sans">
                  {selectedCert.program_title}
                </div>
              </div>

              {/* Signatures & Verification Seal */}
              <div className="pt-8 border-t border-[#C9A84C]/40 grid grid-cols-3 items-end gap-4 text-[11px]">
                {/* Signatory 1 */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-400 pb-1">
                    Dr. Robert Vance, Ph.D.
                  </div>
                  <p className="font-bold text-slate-900">Chief Learning Officer</p>
                  <p className="text-[10px] text-slate-500">OKGIP Global Academy</p>
                </div>

                {/* QR Code Security Stamp */}
                <div className="flex flex-col items-center justify-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-2xs mb-1">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Cryptographic ID</span>
                  <span className="text-[9px] font-mono font-bold text-teal-700">{selectedCert.verification_code}</span>
                </div>

                {/* Signatory 2 */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-400 pb-1">
                    Elena Rostova
                  </div>
                  <p className="font-bold text-slate-900">Head of Talent & Engineering</p>
                  <p className="text-[10px] text-slate-500">Workforce Intelligence Board</p>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
                <span>Cert Serial: <strong className="text-slate-800">{selectedCert.cert_number}</strong></span>
                <span>Issue Date: <strong className="text-slate-800">{selectedCert.issued_date}</strong></span>
                <span className="text-teal-700 font-bold">Ledger Verified • SHA-256 Validated</span>
              </div>
            </div>

            {/* Print & Download Actions (Hidden during print) */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                onClick={() => handleCopyVerification(selectedCert.verification_code)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs cursor-pointer shadow-2xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Verification Code Copied!' : 'Copy Verification Code'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save High-Res PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
