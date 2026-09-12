import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const { email, name, role, schoolName, code, appUrl } = await req.json();

    if (!email || !name || !role || !schoolName || !code || !appUrl) {
      throw new Error('Missing required fields');
    }

    let roleName = 'Membre de l\'équipe';
    if (role === 'teacher') roleName = 'Enseignant';
    else if (role === 'secretariat') roleName = 'Secrétariat';
    else if (role === 'parent') roleName = 'Parent d\'élève';

    const activationUrl = `${appUrl}/activer?code=${code}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // TODO: En production, remplacez cette adresse de test ('onboarding@resend.dev') 
        // par une adresse sur votre domaine vérifié (ex: 'no-reply@elimu.cd') 
        // après l'avoir configuré dans Resend > Domains.
        from: 'Elimu School Manager <onboarding@resend.dev>',
        to: email,
        subject: `Invitation à rejoindre ${schoolName} sur Elimu`,
        html: `
          <div style="font-family: sans-serif; max-w-md; margin: 0 auto; color: #333;">
            <h2 style="color: #4F46E5;">Bienvenue sur Elimu !</h2>
            <p>Bonjour ${name},</p>
            <p>L'établissement <strong>${schoolName}</strong> vous invite à rejoindre son espace en tant que <strong>${roleName}</strong>.</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold;">Votre code d'activation</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #111827;">${code}</p>
            </div>
            <p style="text-align: center;">
              <a href="${activationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                Activer mon compte
              </a>
            </p>
            <p style="font-size: 12px; color: #6B7280; margin-top: 40px; text-align: center;">
              Si le bouton ne fonctionne pas, copiez ce lien :<br>
              <a href="${activationUrl}">${activationUrl}</a>
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API Error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
