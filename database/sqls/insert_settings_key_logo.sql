INSERT INTO public.settings(
    key,
    value,
    type,
    description,
    created_at,
    updated_at,
    setting_category_id
	) VALUES (
    'prematricula.logo',
    (SELECT value FROM public.settings WHERE key = 'legacy.report.logo_file_name' LIMIT 1),
    'string',
    'URL referente à logo do Pré-matrícula Digital',
    now(),
    now(),
    (SELECT id FROM public.settings_categories WHERE name = 'Pré-Matrícula Digital' LIMIT 1)
	);
