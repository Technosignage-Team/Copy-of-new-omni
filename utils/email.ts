
import { DEFAULT_EMAIL_TEMPLATES } from '../data/mockData';

export interface EmailConfig {
  serviceId: string;
  publicKey: string;
  verificationTemplateId: string;
  resetTemplateId: string;
  ticketCreationTemplateId: string;
  ticketUpdateTemplateId: string;
}

export const getEmailConfig = (): EmailConfig | null => {
  try {
    const saved = localStorage.getItem('omni_email_config');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

/**
 * loads a specific template definition (subject/body patterns) from local storage 
 * or falls back to default.
 */
export const getAppTemplate = (templateId: string) => {
    try {
        const saved = localStorage.getItem('omni_email_templates');
        const templates = saved ? JSON.parse(saved) : DEFAULT_EMAIL_TEMPLATES;
        return templates.find((t: any) => t.id === templateId) || DEFAULT_EMAIL_TEMPLATES.find(t => t.id === templateId);
    } catch (e) {
        return DEFAULT_EMAIL_TEMPLATES.find(t => t.id === templateId);
    }
};

/**
 * Replaces {{variable}} placeholders in text with values from params.
 */
export const fillTemplate = (text: string, params: Record<string, string>): string => {
    let result = text;
    for (const [key, value] of Object.entries(params)) {
        // Replace all occurrences of {{key}}
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value || '');
    }
    return result;
};

export const sendEmail = async (
  templateId: string,
  params: Record<string, string>
): Promise<boolean> => {
  const config = getEmailConfig();
  
  // If no config or incomplete config, return false (fall back to mock)
  if (!config || !config.serviceId || !config.publicKey || !templateId) {
    console.warn("EmailJS not fully configured. Missing Service ID, Public Key, or Template ID.", { config, templateId });
    return false;
  }

  // Sanitize config to remove accidental whitespace
  const serviceId = config.serviceId.trim();
  const tId = templateId.trim();
  const publicKey = config.publicKey.trim();

  // Enhance params to support common template variables (to_email, email, recipient, etc.)
  const emailValue = params.to_email || params.email || '';
  
  const enhancedParams = {
      ...params,
      email: emailValue,
      reply_to: emailValue,
      recipient: emailValue,
      recipient_email: emailValue
  };

  const data = {
    service_id: serviceId,
    template_id: tId,
    user_id: publicKey,
    template_params: enhancedParams,
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle "Invalid Grant" specifically - this usually means Gmail token expired in EmailJS
      if (errorText.includes("Invalid grant") || errorText.includes("reconnect your Gmail")) {
          console.error("🚨 CRITICAL EMAILJS ERROR: The Gmail connection token has expired. You must reconnect your Gmail account in the EmailJS Dashboard.");
      }
      
      console.error("EmailJS Error Response:", errorText);
      return false;
    }
    
    console.log("EmailJS Sent Successfully");
    return true;
  } catch (e) {
    console.error("EmailJS Network Error:", e);
    return false;
  }
};
