-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(client_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.clients
  WHERE user_id = auth.uid();
  
  RETURN 'CLI-' || LPAD(next_number::TEXT, 3, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(product_code FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.products
  WHERE user_id = auth.uid();
  
  RETURN 'PRD-' || LPAD(next_number::TEXT, 3, '0');
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;