import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerDriver } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, User, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const VEHICLE_MAKES: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'Prius', 'Alphard', 'Hiace', 'Land Cruiser', 'Axio', 'KDH'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Fit', 'Vezel', 'Grace'],
  Nissan: ['Altima', 'Sentra', 'Rogue', 'Caravan', 'Navara', 'X-Trail'],
  Mercedes: ['E-Class', 'V-Class', 'S-Class', 'Sprinter'],
  BMW: ['5 Series', '7 Series', 'X5'],
  Suzuki: ['Swift', 'Alto', 'Wagon R', 'Celerio', 'Baleno', 'Ciaz'],
  Hyundai: ['Sonata', 'Tucson', 'Palisade', 'Staria', 'Elantra'],
  Kia: ['Optima', 'Sorento', 'Carnival', 'Sedona'],
  Ford: ['Transit', 'Explorer', 'Focus', 'Tourneo'],
  Audi: ['A6', 'A8', 'Q7'],
  Mitsubishi: ['Outlander', 'Lancer', 'Montero', 'L300'],
  Tata: ['Nano', 'Indica', 'Indigo', 'Winger', 'LP'],
};

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Minivan', 'Passenger Van', 'Luxury Sedan', 'Mini Bus', 'Bus', 'Three Wheeler', 'Tuk Tuk'];
const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Beige', 'Brown', 'Yellow', 'Other'];

export default function DriverRegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedMake, setSelectedMake] = useState('Toyota');

  // Personal fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contact, setContact] = useState('');
  const [nic, setNic] = useState('');
  const [address, setAddress] = useState('');

  // Vehicle fields
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehicleModel, setVehicleModel] = useState(VEHICLE_MAKES['Toyota'][0]);
  const [vehicleYear, setVehicleYear] = useState(2024);
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [color, setColor] = useState('White');

  const handleStep1Next = () => {
    if (!name || !email || !password || !licenseNumber || !contact) {
      setError('Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber) {
      setError('Please enter your vehicle plate number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await registerDriver({
        name, email, password, licenseNumber, contact, nic, address,
        vehicle: {
          type: vehicleType,
          make: selectedMake,
          model: vehicleModel,
          year: vehicleYear,
          plateNumber,
          capacity,
          color,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-slate-100 p-5 font-sans relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px] bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 text-center shadow-2xl shadow-black/50 z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-white text-2xl font-extrabold mb-3">Registration Submitted!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-7">
            Your registration has been sent to the administrator for review. 
            You'll be able to log in once your account is <strong className="text-green-400 font-semibold">approved</strong>.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-7 text-amber-400 text-sm font-medium">
            ⏳ Status: <strong>Pending Approval</strong>
          </div>
          <Link to="/driver/login" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 no-underline">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-slate-100 p-5 py-10 font-sans relative overflow-hidden">
      <div className="fixed -top-[30%] -left-[10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[560px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30"
          >
            <Car className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight mb-1">
            Driver Registration
          </h1>
          <p className="text-slate-400 text-sm">
            Step {step} of 2 — {step === 1 ? 'Personal Details' : 'Vehicle Information'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-1.5 rounded-full bg-indigo-500 transition-all duration-300" />
          <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700/50'}`} />
        </div>

        {/* Card */}
        <div className="bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-red-300 text-sm font-medium">{error}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-white text-lg font-bold mb-5 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Full Name *</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kamal Perera" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Email Address *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamal@email.com" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Password *</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Confirm Password *</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">License Number *</label>
                      <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="B-1234567" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Contact Number *</label>
                      <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+94 77 123 4567" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">NIC Number</label>
                      <input value={nic} onChange={(e) => setNic(e.target.value)} placeholder="200012345678" className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Address</label>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Colombo" className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStep1Next}
                    className="w-full py-3 mt-6 rounded-xl border-none cursor-pointer font-bold text-sm text-white tracking-wide transition-all shadow-lg shadow-indigo-500/25 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center gap-2 hover:opacity-90"
                  >
                    Next — Vehicle Details <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-white text-lg font-bold mb-5 flex items-center gap-2">
                    <Car className="w-5 h-5 text-indigo-400" /> Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Vehicle Type *</label>
                      <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                        {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Make (Company) *</label>
                      <select
                        value={selectedMake}
                        onChange={(e) => {
                          setSelectedMake(e.target.value);
                          setVehicleModel(VEHICLE_MAKES[e.target.value][0]);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        {Object.keys(VEHICLE_MAKES).map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Model *</label>
                      <select value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                        {VEHICLE_MAKES[selectedMake]?.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Year *</label>
                      <select value={vehicleYear} onChange={(e) => setVehicleYear(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                        {Array.from({ length: 20 }, (_, i) => 2026 - i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Color *</label>
                      <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                        {VEHICLE_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Plate Number *</label>
                      <input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="ABC-1234" required className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Passenger Capacity *</label>
                      <input type="number" min={1} max={60} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                    </div>
                  </div>

                  {/* Vehicle preview */}
                  <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="text-slate-400 text-xs font-bold mb-1.5 uppercase tracking-wider">
                      Vehicle Preview
                    </div>
                    <div className="text-white text-sm font-bold">
                      {color} {selectedMake} {vehicleModel} ({vehicleYear}) — {vehicleType}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      Plate: {plateNumber || '—'} · Capacity: {capacity} passengers
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); }}
                      className="flex-1 py-3 rounded-xl border border-slate-700 bg-transparent text-slate-300 font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 rounded-xl border-none font-bold text-sm text-white tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
                      style={{
                        background: loading ? 'rgba(34, 197, 94, 0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        boxShadow: loading ? 'none' : '0 4px 20px rgba(34,197,94,0.3)',
                        cursor: loading ? 'wait' : 'pointer'
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Submit Registration
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              Already registered?{' '}
              <Link to="/driver/login" className="text-indigo-400 no-underline font-semibold hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
