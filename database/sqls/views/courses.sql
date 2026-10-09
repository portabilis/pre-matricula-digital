CREATE OR REPLACE VIEW public.courses AS
SELECT
    curso.cod_curso AS id,
    curso.nm_curso AS name
FROM pmieducar.curso
WHERE ativo = 1
