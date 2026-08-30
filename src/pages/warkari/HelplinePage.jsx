import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, Mail, Shield, Heart, Siren, Cross, ExternalLink } from 'lucide-react';
import SOSButton from '../../components/SOSButton';
import { EMERGENCY_CONTACTS } from '../../lib/mockData';

const ICON_MAP = {
  Siren: Siren,
  Shield: Shield,
  Ambulance: Cross,
  HeadsetIcon: Phone,
  ShieldCheck: Heart,
};

export default function HelplinePage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
      {/* Emergency Contacts */}
      <div>
        <h2 className="text-sm font-semibold text-wari-text dark:text-white mb-3 flex items-center gap-1.5">
          <Phone size={15} className="text-wari-saffron" />
          {t('helpline.emergency_contacts')}
        </h2>
        <div className="space-y-2">
          {EMERGENCY_CONTACTS.map((contact, i) => {
            const Icon = ICON_MAP[contact.icon] || Phone;
            return (
              <motion.a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-wari-border dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${contact.color}15` }}
                >
                  <Icon size={18} style={{ color: contact.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-wari-text dark:text-white">
                    {contact.nameKey ? t(contact.nameKey) : contact.name}
                  </div>
                  <div className="text-xs text-wari-text-secondary dark:text-slate-400 font-mono">{contact.number}</div>
                </div>
                <div className="emergency-btn text-white text-xs" style={{ backgroundColor: contact.color }}>
                  <Phone size={12} /> {t('helpline.call')}
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Official Email */}
        <a
          href="mailto:pandharpur_helpline@gov.in"
          className="flex items-center gap-3 p-3 mt-2 bg-white dark:bg-slate-800 rounded-xl border border-wari-border dark:border-slate-700"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <Mail size={18} className="text-gray-500 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-wari-text dark:text-white">{t('helpline.email')}</div>
            <div className="text-xs text-wari-text-secondary dark:text-slate-400">pandharpur_helpline@gov.in</div>
          </div>
          <ExternalLink size={14} className="text-wari-text-secondary dark:text-slate-400" />
        </a>
      </div>

      {/* SOS Section */}
      <div className="text-center">
        <h2 className="text-sm font-semibold text-wari-text dark:text-white mb-2">{t('helpline.sos_title')}</h2>
        <p className="text-xs text-wari-text-secondary dark:text-slate-400 mb-6 max-w-[280px] mx-auto">
          {t('helpline.sos_description')}
        </p>
        <SOSButton />
      </div>

      {/* Footer Links */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-wari-border dark:border-slate-800">
        <a href="#" className="text-[10px] text-wari-text-secondary dark:text-slate-500 hover:text-wari-saffron">{t('helpline.privacy')}</a>
        <span className="text-wari-border dark:text-slate-700">•</span>
        <a href="#" className="text-[10px] text-wari-text-secondary dark:text-slate-500 hover:text-wari-saffron">{t('helpline.terms')}</a>
        <span className="text-wari-border dark:text-slate-700">•</span>
        <a href="#" className="text-[10px] text-wari-text-secondary dark:text-slate-500 hover:text-wari-saffron">{t('helpline.offline_guide')}</a>
      </div>
    </div>
  );
}
