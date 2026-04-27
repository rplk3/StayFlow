const fs = require('fs');

let content = fs.readFileSync('src/modules/hotelRoom/pages/Checkout.jsx', 'utf8');

const target = `    // Step indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-6">
            {[
                { num: 1, label: 'Details & Transport' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Confirmation' }
            ].map((s, i) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center">
                        <div
                            className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 \${step >= s.num ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-500'}\`}
                            style={step >= s.num ? { background: \`linear-gradient(135deg, \${C[700]}, \${C[500]})\`, boxShadow: \`0 4px 14px \${C[500]}44\` } : {}}
                        >
                            {step > s.num ? <CheckCircle size={18} /> : s.num}
                        </div>
                        <span
                            className={\`text-xs mt-2 font-medium whitespace-nowrap \${step >= s.num ? 'font-semibold' : 'text-gray-400'}\`}
                            style={step >= s.num ? { color: C[700] } : {}}
                        >
                            {s.label}
                        </span>
                    </div>
                    {i < 2 && (
                        <div
                            className="w-16 md:w-24 h-0.5 mx-2 mt-[-16px] rounded-full transition-all duration-500"
                            style={{ background: step > s.num ? C[500] : '#e5e7eb' }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );`;

const replacement = `    // Step indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-6">
            {[
                { num: 1, label: 'Details & Transport' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Confirmation' }
            ].map((s, i) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center">
                        <div
                            className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 \${step === s.num ? 'text-white shadow-lg' : step > s.num ? 'bg-white shadow-sm border-2' : 'bg-gray-200 text-gray-500'}\`}
                            style={step === s.num ? { background: \`linear-gradient(135deg, \${C.primary || C[900]}, \${C.action || C[600]})\`, boxShadow: \`0 4px 14px \${C.action || C[600]}44\` } : step > s.num ? { color: C.action || C[600], borderColor: C.action || C[600] } : {}}
                        >
                            {step > s.num ? <Check size={20} style={{ color: C.action || C[600] }} /> : s.num}
                        </div>
                        <span
                            className={\`text-xs mt-2 font-medium whitespace-nowrap \${step >= s.num ? 'font-bold' : 'text-gray-400'}\`}
                            style={step >= s.num ? { color: C.primary || C[900] } : {}}
                        >
                            {s.label}
                        </span>
                    </div>
                    {i < 2 && (
                        <div
                            className="w-16 md:w-24 h-0.5 mx-2 mt-[-16px] rounded-full transition-all duration-500"
                            style={{ background: step > s.num ? C.action || C[600] : '#e5e7eb' }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );`;

const normalizedContent = content.replace(/\\r\\n/g, '\\n');
const normalizedTarget = target.replace(/\\r\\n/g, '\\n');

if (normalizedContent.includes(normalizedTarget)) {
    const result = normalizedContent.replace(normalizedTarget, replacement);
    fs.writeFileSync('src/modules/hotelRoom/pages/Checkout.jsx', result);
    console.log("Successfully replaced step indicator in Checkout.jsx");
} else {
    console.log("Could not find target in Checkout.jsx. Trying alternative target without CheckCircle import.");
    // Let's just do a regex replace for the CheckCircle inside the StepIndicator
}
