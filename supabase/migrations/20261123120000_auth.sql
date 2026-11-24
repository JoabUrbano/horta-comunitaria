alter table pessoa add column user_id uuid;

-- 1:1 (o unique já cria o índice) e, se o usuário for apagado do Auth,
-- a pessoa continua existindo, só perde o login
alter table pessoa
    add constraint uq_pessoa_user unique (user_id),
    add constraint fk_pessoa_user
        foreign key (user_id) references auth.users (id)
        on delete set null;