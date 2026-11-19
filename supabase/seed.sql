-- Dados de exemplo para testar as consultas do README.
-- Rodar só em banco de desenvolvimento (o `supabase db reset` aplica este arquivo sozinho).

insert into especie (nome_popular, nome_cientifico) values
    ('Alface',     'Lactuca sativa'),
    ('Tomate',     'Solanum lycopersicum'),
    ('Manjericão', 'Ocimum basilicum');

insert into canteiro (nome, comprimento_m, largura_m) values
    ('Canteiro A', 3.00, 1.20),
    ('Canteiro B', 2.50, 1.00),
    ('Canteiro C', 2.00, 1.00);  -- ainda sem grupo responsável

insert into praga (nome, sintomas) values
    ('Pulgão',     'Folhas enroladas e presença de insetos pequenos sob as folhas'),
    ('Lagarta',    'Folhas roídas e fezes escuras'),
    ('Cochonilha', 'Manchas algodonosas nos caules');

insert into pessoa (nome, email, telefone) values
    ('Ana Souza',     'ana@exemplo.com',   '84999990001'),  -- id 1
    ('Bruno Lima',    'bruno@exemplo.com', '84999990002'),  -- id 2
    ('Carla Mendes',  null,                '84999990003'),  -- id 3 (sem e-mail)
    ('Diego Ferreira','diego@exemplo.com', null),           -- id 4 (sem telefone)
    ('Elisa Rocha',   'elisa@exemplo.com', '84999990005'); -- id 5 (ainda sem grupo)

insert into grupo (nome, descricao, canteiro_id) values
    ('Grupo das Folhosas', 'Cuida das alfaces do Canteiro A', 1),  -- id 1
    ('Grupo dos Tomates',  'Cuida do Canteiro B',             2),  -- id 2
    ('Grupo Novo',         'Ainda sem canteiro',              null); -- id 3

insert into grupo_pessoa (grupo_id, pessoa_id) values
    (1, 1), (1, 2),
    (2, 2), (2, 3),   -- Bruno participa de dois grupos
    (3, 4);

insert into planta (especie_id, canteiro_id, localizacao_descricao, data_plantio) values
    (1, 1,    'Fileira 1, início do canteiro',   '2026-09-01'),  -- id 1
    (1, 1,    'Fileira 1, meio do canteiro',     '2026-09-01'),  -- id 2
    (2, 2,    'Fileira única, ao lado da cerca', '2026-08-15'),  -- id 3
    (2, 2,    'Fileira única, centro',           '2026-08-15'),  -- id 4
    (3, null, 'Vaso na janela da sala 3',        '2026-10-05');  -- id 5 (sem canteiro)

insert into planta_praga (planta_id, praga_id, data_observacao, data_resolucao, severidade) values
    (1, 1, '2026-10-10', null,         'moderada'),  -- id 1: pulgão ativo
    (2, 1, '2026-10-10', '2026-10-20', 'leve'),      -- id 2: pulgão resolvido
    (3, 2, '2026-10-12', null,         'grave');     -- id 3: lagarta ativa

insert into pasta (nome, descricao, modo_de_uso) values
    ('Pasta de alho e sabão', 'Repelente caseiro contra insetos de corpo mole',
     'Bater o alho com a água, misturar o sabão e borrifar nas folhas no fim da tarde.');

insert into ingrediente (nome) values ('Alho'), ('Sabão de coco'), ('Água');

insert into pasta_ingrediente (pasta_id, ingrediente_id, quantidade, unidade) values
    (1, 1, 5,    'dentes'),
    (1, 2, 1,    'colher de sopa'),
    (1, 3, 1000, 'ml');

-- Aplicação no Canteiro A (evento + plantas atingidas), num comando só
with ap as (
    insert into aplicacao_pasta (pasta_id, data_aplicacao, quantidade_usada)
    values (1, '2026-10-14', '1 litro')
    returning id
)
insert into aplicacao_planta (aplicacao_id, planta_id, planta_praga_id)
select ap.id, v.planta_id, v.planta_praga_id
from ap
cross join (values (1, 1), (2, 2)) as v (planta_id, planta_praga_id);  -- tratando o pulgão das plantas 1 e 2
