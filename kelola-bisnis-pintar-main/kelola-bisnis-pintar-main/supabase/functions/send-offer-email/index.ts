import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OfferEmailRequest {
  offerId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Resend client
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { offerId }: OfferEmailRequest = await req.json();

    if (!offerId) {
      throw new Error("Offer ID is required");
    }

    // Fetch offer details with items
    const { data: offer, error: offerError } = await supabase
      .from("price_offers")
      .select(`
        *,
        price_offer_items (*)
      `)
      .eq("id", offerId)
      .single();

    if (offerError) {
      console.error("Error fetching offer:", offerError);
      throw new Error("Failed to fetch offer details");
    }

    if (!offer) {
      throw new Error("Offer not found");
    }

    if (!offer.client_email) {
      throw new Error("Client email not found");
    }

    // Generate HTML content for the offer
    const itemsHtml = offer.price_offer_items
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #e5e5e5;">
          <td style="padding: 12px; text-align: left;">${item.product_name}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.unit_price)}</td>
          <td style="padding: 12px; text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.subtotal)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Penawaran Harga ${offer.offer_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0a192f; color: white; padding: 20px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px;">Penawaran Harga</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">${offer.offer_number}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #0a192f; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">Kepada Yth,</h2>
            <p style="font-size: 16px; margin: 10px 0;"><strong>${offer.client_name}</strong></p>
            ${offer.client_address ? `<p style="margin: 5px 0;">${offer.client_address}</p>` : ''}
          </div>

          <div style="margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold;">Tanggal Penawaran:</td>
                <td style="padding: 10px 0;">${new Date(offer.offer_date).toLocaleDateString('id-ID')}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold;">Berlaku Hingga:</td>
                <td style="padding: 10px 0;">${new Date(offer.valid_until).toLocaleDateString('id-ID')}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #0a192f; margin-bottom: 15px;">Detail Penawaran:</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #0a192f;">Produk/Jasa</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #0a192f;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #0a192f;">Harga Satuan</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #0a192f;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <table style="width: 100%; max-width: 300px; margin-left: auto;">
              <tr>
                <td style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 8px; text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(offer.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; text-align: right; font-weight: bold;">Pajak (${offer.tax_percentage}%):</td>
                <td style="padding: 8px; text-align: right;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(offer.tax_amount)}</td>
              </tr>
              <tr style="border-top: 2px solid #0a192f; background-color: #f8f9fa;">
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">TOTAL:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #0a192f;">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(offer.total_amount)}</td>
              </tr>
            </table>
          </div>

          ${offer.notes ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #0a192f; margin-bottom: 15px;">Catatan:</h3>
            <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ffd700; margin: 0;">${offer.notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Terima kasih atas kepercayaan Anda. Untuk pertanyaan lebih lanjut, silakan hubungi kami.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              Email ini dikirim secara otomatis oleh sistem Orderly.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Orderly <noreply@resend.dev>",
      to: [offer.client_email],
      subject: `Penawaran Harga ${offer.offer_number} - ${offer.client_name}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-offer-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);