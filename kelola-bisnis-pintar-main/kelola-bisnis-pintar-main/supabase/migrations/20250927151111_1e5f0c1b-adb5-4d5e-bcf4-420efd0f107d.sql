-- Create price_offers table
CREATE TABLE public.price_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_number TEXT NOT NULL,
  client_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  tax_percentage NUMERIC NOT NULL DEFAULT 11,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT price_offers_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT
);

-- Create price_offer_items table
CREATE TABLE public.price_offer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_offer_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT price_offer_items_price_offer_id_fkey FOREIGN KEY (price_offer_id) REFERENCES public.price_offers(id) ON DELETE CASCADE,
  CONSTRAINT price_offer_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT
);

-- Enable Row Level Security
ALTER TABLE public.price_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_offer_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for price_offers
CREATE POLICY "Users can view their own price offers" 
ON public.price_offers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price offers" 
ON public.price_offers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price offers" 
ON public.price_offers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price offers" 
ON public.price_offers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for price_offer_items
CREATE POLICY "Users can view their own price offer items" 
ON public.price_offer_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.price_offers 
  WHERE price_offers.id = price_offer_items.price_offer_id 
  AND price_offers.user_id = auth.uid()
));

CREATE POLICY "Users can create their own price offer items" 
ON public.price_offer_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.price_offers 
  WHERE price_offers.id = price_offer_items.price_offer_id 
  AND price_offers.user_id = auth.uid()
));

CREATE POLICY "Users can update their own price offer items" 
ON public.price_offer_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.price_offers 
  WHERE price_offers.id = price_offer_items.price_offer_id 
  AND price_offers.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own price offer items" 
ON public.price_offer_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.price_offers 
  WHERE price_offers.id = price_offer_items.price_offer_id 
  AND price_offers.user_id = auth.uid()
));

-- Create function to generate offer number
CREATE OR REPLACE FUNCTION public.generate_offer_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(offer_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.price_offers
  WHERE user_id = auth.uid();
  
  RETURN 'PO-' || LPAD(next_number::TEXT, 4, '0');
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_price_offers_updated_at
BEFORE UPDATE ON public.price_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_price_offers_user_id ON public.price_offers(user_id);
CREATE INDEX idx_price_offers_client_id ON public.price_offers(client_id);
CREATE INDEX idx_price_offers_status ON public.price_offers(status);
CREATE INDEX idx_price_offer_items_price_offer_id ON public.price_offer_items(price_offer_id);
CREATE INDEX idx_price_offer_items_product_id ON public.price_offer_items(product_id);