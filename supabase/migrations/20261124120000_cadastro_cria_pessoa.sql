-- =========================================================
-- Cadastro pelo app cria (ou liga) a pessoa automaticamente
-- =========================================================
-- Quando alguém se cadastra na tela de registro, o Supabase cria a linha em
-- auth.users. Este gatilho cria a pessoa correspondente em public.pessoa,
-- com o nome e o telefone que vieram do formulário, e preenche pessoa.user_id.
--
-- Se já existir uma pessoa com o mesmo e-mail (cadastrada antes por alguém do
-- grupo) e ainda sem login, ela é LIGADA ao novo usuário em vez de duplicada.
--
-- O gatilho nunca pode falhar: se falhar, o Supabase recusa o cadastro com
-- "Database error saving new user". Por isso os valores são limpos e cortados
-- no tamanho das colunas (alguém pode chamar a API direto, sem passar pela tela).

create or replace function public.criar_pessoa_do_cadastro()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_nome     text;
    v_telefone text;
begin
    v_nome := left(
        coalesce(
            nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''),
            split_part(new.email, '@', 1)
        ),
        150
    );

    v_telefone := left(
        nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '\D', '', 'g'), ''),
        20
    );

    insert into public.pessoa (nome, email, telefone, user_id)
    values (v_nome, lower(new.email), v_telefone, new.id)
    on conflict ((lower(email))) do update
        set user_id  = excluded.user_id,
            telefone = coalesce(public.pessoa.telefone, excluded.telefone)
        where public.pessoa.user_id is null;

    return new;
end;
$$;

-- a função só roda pelo gatilho; ninguém precisa chamá-la pela API
revoke all on function public.criar_pessoa_do_cadastro() from public, anon, authenticated;

drop trigger if exists ao_cadastrar_cria_pessoa on auth.users;

create trigger ao_cadastrar_cria_pessoa
    after insert on auth.users
    for each row
    execute function public.criar_pessoa_do_cadastro();
