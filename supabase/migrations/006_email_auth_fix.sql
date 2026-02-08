-- Fix handle_new_user to handle username conflicts gracefully
-- When email signup creates a duplicate username, append a random suffix
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  suffix text;
BEGIN
  -- Generate base username from name or email
  base_username := lower(replace(
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    ' ', ''
  ));

  -- Try the base username first
  final_username := base_username;

  -- If it already exists, append a random 4-char suffix
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
    suffix := substr(md5(random()::text), 1, 4);
    final_username := base_username || suffix;
  END IF;

  -- If STILL exists (very unlikely), use the user's UUID prefix
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
    final_username := base_username || substr(new.id::text, 1, 8);
  END IF;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
