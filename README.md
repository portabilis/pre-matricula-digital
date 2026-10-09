# Pré-Matrícula Digital (PMD)

O **[Pré-Matrícula Digital (PMD)](https://ieducar.com.br/pre-matricula-digital/)** é um módulo de **gestão de vagas e listas de espera na Educação Infantil**, integrado ao [i-Educar](https://github.com/portabilis/i-educar), agora disponível também como **código aberto**.  

Ele apoia municípios no cumprimento das Leis **14.685/2023** e **14.851/2024**, garantindo que a gestão de vagas e filas seja feita de forma **organizada, transparente e auditável**.  

📺 O código aberto foi lançado em julho/2025 em evento público com participação do **MEC**, da **Fundação Lemann** e de representantes de **Canoas/RS** e **Gaspar/SC**. Assista no [YouTube](https://www.youtube.com/watch?v=pY7HYZ-6bHY).  

**Destaques principais:**  
- Gestão centralizada e organizada das listas de espera  
- Publicação automática de critérios e resultados  
- Histórico de alterações para segurança e auditoria  
- Integração com o portal [Minha Vaga na Creche](https://minhavaganacreche.org.br) para transparência pública  

Com o PMD, redes municipais modernizam seus processos de matrícula, aumentam a confiança das famílias e reduzem riscos de judicialização como consequência da transparência.  

## Instalação

Para instalar o projeto execute os comandos abaixo no diretório raiz do i-Educar:

```bash
git clone git@github.com:portabilis/pre-matricula-digital.git packages/portabilis/pre-matricula-digital

cp packages/portabilis/pre-matricula-digital/.env.example packages/portabilis/pre-matricula-digital/.env
```

### Docker

Utilizando Docker, adicione o serviço `pmd` ao seu arquivo `docker-compose.override.yml`:

```yaml
services:
  
  pmd:
    container_name: ieducar-pmd
    image: node:22-alpine
    command: yarn dev --host 0.0.0.0
    ports:
      - "5173:5173"
    volumes:
      - ./packages/portabilis/pre-matricula-digital:/var/www/pre-matricula-digital
    working_dir: /var/www/pre-matricula-digital
```

Configure no seu arquivo `.env` na raíz do i-Educar:

```bash
FRONTIER_PROXY_HOST=http://host.docker.internal:5173
FRONTIER_PROXY_RULES=/pre-matricula-digital::replace(/resources/ts/main.ts,http://localhost:5173/resources/ts/main.ts)::replace(/@vite/client,http://localhost:5173/@vite/client)
```

Finalize a instalação do projeto:

```bash
docker compose exec php composer plug-and-play:update
docker compose exec php php artisan migrate
docker compose run --rm pmd yarn install 
docker compose down
docker compose up -d
```

### Servidor

Instalando diretamente no seu servidor, garanta que você tenha o [Yarn](https://yarnpkg.com/) instalado.
 
```bash
apt install -y npm && npm -g install yarn
```

Configure no seu arquivo `.env` na raíz do i-Educar:

```bash
FRONTIER_ENDPOINT=/pre-matricula-digital
FRONTIER_VIEWS_PATH=packages/portabilis/pre-matricula-digital/dist
```

Finalize a instalação do projeto:

```bash
composer plug-and-play:update

yarn --cwd packages/portabilis/pre-matricula-digital install
yarn --cwd packages/portabilis/pre-matricula-digital build --base=/vendor/pre-matricula-digital/

php artisan migrate
php artisan vendor:publish --tag=pmd
```

## Configurações

O Pré-Matrícula Digital pode ser configurado via variáveis de ambiente do i-Educar.

| Variável            | Descrição                                                     |
|---------------------|---------------------------------------------------------------| 
| `PMD_IBGE_CODES`    | Se informado irá limitar inscrições com endereço do município |
| `PMD_CITY`          | Nome do município                                             |
| `PMD_STATE`         | Sigla do estado                                               |
| `PMD_MAP_LATITUDE`  | Latitude onde o mapa irá ser exibido                          |
| `PMD_MAP_LONGITUDE` | Longitude onde o mapa irá ser exibido                         |
| `PMD_MAP_ZOOM`      | Zoom do mapa                                                  |
| `PMD_LOGO`          | URL da logo utilizada no sistema                              |

### Requisitos

Para o Pré-Matrícula Digital funcionar, alguns campos no i-Educar precisam estar preenchidos corretamente.

1. Ano letivo aberto e em andamento
2. As escolas devem possuir latitude e longitude cadastradas
3. Turmas com vagas disponíveis no ano letivo
4. Os cursos devem ter o checkbox "Importar os dados do curso para o recurso de Pré-Matrícula Digital?"
5. As séries devem ter o checkbox "Importar os dados da série para o recurso de Pré-Matrícula Digital?"
6. Uma chave de API válida do [Froala Editor](https://froala.com/)

### Desenvolvimento

Este repositório contém o código-fonte da interface do usuário e do backend da aplicação e visa trazer ao projeto mais 
dinamicidade, tecnologia, inovação e manutenibilidade.

O Pré-Matrícula Digital é construído utilizando as tecnologias:

- [Laravel](https://laravel.com/)
- [Vue.js](https://vuejs.org)
- [Bootstrap](https://getbootstrap.com)
- [Leaflet](https://leafletjs.com/) e [OpenStreetMap](https://www.openstreetmap.org/)

#### Dependências

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [PHP](https://www.php.net/)
- [Postgres](https://www.postgresql.org/)
- [GraphQL](https://graphql.org/)

#### Frontend

O frontend é construído utilizando [Vue.js](https://vuejs.org) sobre os conceitos de [SPA](https://en.wikipedia.org/wiki/Single-page_application).

#### Backend

O backend é construído utilizando [Laravel](https://laravel.com/) e [Lighthouse](https://lighthouse-php.com/) sobre os conceitos de 
[Service Provider](https://laravel.com/docs/master/providers) e como um pacote para o i-Educar.

---

Powered by [Portábilis](https://portabilis.com.br).
