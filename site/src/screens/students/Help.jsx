import { useState } from "react";
import { FiHelpCircle, FiSearch, FiPlusSquare, FiCheckCircle, FiChevronDown, FiPhone } from "react-icons/fi";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      icon: FiSearch,
      title: "1. Search Lost Items",
      description: "Browse or search the database using keywords, categories, or campus locations (e.g., Main Library, Student Center)."
    },
    {
      icon: FiPlusSquare,
      title: "2. Report an Item",
      description: "If you lost or found an item, fill out the report form with a title, description, location, and optional photo."
    },
    {
      icon: FiCheckCircle,
      title: "3. Verify & Claim",
      description: "Visit the Campus Protection Services (CPS) office or designated drop-off point with your UWC ID to claim your item."
    }
  ];

  const faqs = [
    {
        q: "Where do I drop off physical items found on campus?",
        a: "You can hand in found items to Campus Protection Services (CPS) at the Main Gate, the Main Library Security Desk, or the Student Center Helpdesk."
    },
    {
        q: "What proof is required to claim a lost item?",
        a: "You must present a valid UWC Student/Staff ID card. For electronic devices, wallets, or bags, you may be asked to unlock the device, enter a PIN, or describe unique undisclosed contents."
    },
    {
        q: "What is the difference between a 'Lost' and a 'Stolen' item report?",
        a: "Mark an item as 'Lost' if you misplaced it by accident. Mark it as 'Stolen' if you believe it was taken intentionally without your consent. Stolen items automatically notify Campus Protection Services (CPS)."
    },
    {
        q: "How long are lost items retained by the university?",
        a: "Unclaimed items are held securely by CPS for up to 90 days. After this retention period, unclaimed items are donated, recycled, or disposed of according to official UWC policies."
    },
    {
        q: "How do I claim high-value items like laptops, phones, or passports?",
        a: "High-value items are transferred to the primary CPS Security Office. To claim them, you must provide your Student ID, proof of purchase, matching serial number, or IMEI number, and unlock the device in front of an officer."
    },
    {
        q: "Can I update or delete my report if I find my item on my own?",
        a: "Yes! Log into your account, navigate to 'My Reports', select the item, and click 'Mark as Found' or 'Delete Report' so other students know the item is no longer missing."
    },
    {
        q: "What happens if someone makes a false claim on my item?",
        a: "All claim requests are cross-verified by UWC staff and CPS before physical handover. Attempting to claim property that belongs to someone else is a violation of the UWC Student Code of Conduct and will result in disciplinary action."
    },
    {
        q: "What are the physical lost & found collection office hours?",
        a: "The main CPS Lost & Found desk at the Main Gate operates Monday through Friday from 08:00 to 16:00. Emergency reports can be logged 24/7."
    },
    {
        q: "Why is my serial number or IMEI requested when logging a report?",
        a: "Providing a serial number or IMEI gives absolute proof of ownership and prevents fraudulent claims. This information is kept private and is only visible to UWC administrators."
    },
    {
        q: "What should I do if I lost my official UWC Student ID card?",
        a: "Check the system first—many found ID cards are uploaded daily. If it is not listed, report it as lost in the system and visit the Student Records office for a replacement card."
    }
    ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 p-4 overflow-y-auto bg-[#eaf1f7]">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#152862] flex items-center gap-2">
          <FiHelpCircle className="text-[#cead5e]" /> Need Help?
        </h1>
        <p className="text-sm font-semibold text-gray-600">
          Don't worry, we got you! Here is everything you need to know about using the UWC Stolen & Lost Items System.
        </p>
      </div>

      {/* How to Use Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#152862] mb-3">How to Use the System</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-300 flex flex-col gap-2 shadow-sm">
              <step.icon className="text-[#cead5e] text-2xl" />
              <h3 className="font-bold text-sm text-[#152862]">{step.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions (Accordion) */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#152862] mb-3">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full p-3.5 text-left font-semibold text-sm text-[#152862] flex justify-between items-center cursor-pointer hover:bg-gray-50"
              >
                <span>{faq.q}</span>
                <FiChevronDown className={`transition-transform duration-200 ${openFaq === index ? "rotate-180 text-[#cead5e]" : "text-gray-400"}`} />
              </button>
              {openFaq === index && (
                <div className="px-3.5 pb-3.5 text-xs text-gray-600 border-t border-gray-100 pt-2 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Footer */}
      <div className="mt-auto bg-[#152862] text-white p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <FiPhone className="text-[#cead5e] text-xl" />
          <div>
            <p className="text-xs font-bold">Need Immediate Assistance?</p>
            <p className="text-[11px] text-gray-300">Contact UWC Campus Protection Services (CPS) or IT Helpdesk</p>
          </div>
        </div>
        <a 
          href="mailto:ithelpdesk@uwc.ac.za" 
          className="text-xs font-bold text-[#152862] bg-[#cead5e] px-3 py-2 rounded-lg hover:bg-[#b89a50] transition-colors"
        >
          Contact IT Support
        </a>
      </div>

    </div>
  );
}

export default Help;