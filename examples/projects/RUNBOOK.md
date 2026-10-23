# Projects: installing it and checking it by hand

How an admin puts `rfx/projects` 1.3.0 into an organization and opens its screens inside AgentFlow, then a pass by hand as each kind of person. Section 5 covers the standalone site: the same module on its own origin, with its own sign-in and server. The general flow (build, seal, deploy, approve) is in the guide: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/kiem-tra-va-trien-khai` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/kiem-tra-va-trien-khai`).

## 1. Before you start

- An AgentFlow deployment recent enough for the manifest's `ui` and `launcher` members (an older one refuses the package), with the API and the workers on the same build.
- A service principal key (`afk_…`) with `integration.admin`, in `AGENTFLOW_TOKEN`, and the deployment's address in `AGENTFLOW_URL`, for `agentflow-app deploy`.
- Five people to test with, besides yourself: a project admin, a manager, a member, a collaborator and an outsider (section 4). Give everyone but the outsider's pass a browser profile of their own, or sign in and out between passes.

## 2. The groups, the principal and the parameters

Make these in **Admin** and note each id. The README's "Seal, install and arm" says what each one is for.

1. **Project users**: everyone who uses Projects, all five test people included. Give its members a role with `entity.read`, `entity.list`, `entity.write` and `entity.delete`.
2. **Project creators**: who may create projects. Put the manager in it.
3. **Project admins**: the project admin; give them the same role as the project users.
4. **The automation principal**: a service principal with a role holding `entity.read`, `entity.list` and `entity.write`, and no credential.
5. **The automation group**: the automation principal and one dedicated account that never signs in, nobody else (setup counts only people as members).

Copy `parameters.example.json` to a file outside the project and fill in the five ids, each the UUID in the address of the group's page (the principal's id for the principal):

```json
{
  "project_users": "<Project users>",
  "project_creators": "<Project creators>",
  "automation_principal": "<the automation principal>",
  "automation_group": "<the automation group>",
  "project_admins": "<Project admins>"
}
```

## 3. Deploy it, turn on its triggers and open it

1. **Seal.** In the project's folder, after `pnpm install`:
   ```bash
   pnpm exec agentflow-app keygen --key-id <id>    # once: writes keys/<id>.pem, mode 0600
   pnpm pack:app
   ```
   It builds `package/` and the module into `package/ui/`, and seals them with the one key in `keys/`, writing `dist-app/rfx-projects-1.3.0.afpkg`. To use another key, add `--key /path/to/key.pem --key-id <id>`. Sealing the same package again leaves the archive as it is, and a changed package under the same version is refused (`SEAL_OUT_EXISTS`): raise `version` in `config/package-manifest.json`.
2. **Deploy.**
   ```bash
   pnpm exec agentflow-app deploy --parameters /abs/path/to/parameters.json --wait
   ```
   An admin opens the link it prints and completes the setup and presses **Approve and activate**. Projects has no model, Code step or inbound trigger, so no provider key, code runner or `https` public base is needed.
3. **Turn on the three triggers** (Stamp completion, Freeze on close, Unfreeze on reopen). They ship off. The install's receipt, under **Admin → Apps**, lists them under **Automation** with **Turn on triggers**; **Turn on triggers** turns on exactly the triggers listed, so after an upgrade it turns on only the new one. The operator can do the same from the command line.

   **Upgrading from 1.0.0:** seal and deploy the 1.1.0 archive the same way; the setup page shows an upgrade. An upgrade never changes a trigger's armed state, so `freeze_on_close` stays on while the new `unfreeze_on_reopen` lands off, and the receipt lists `trigger:unfreeze_on_reopen`. Until it is on, reopening a project leaves its tasks frozen. Press **Turn on triggers** on the receipt: it turns on only the listed trigger. The operator's `arm --only trigger:unfreeze_on_reopen` does the same from the command line, and a plain `arm` would also turn back on a trigger an admin turned off. The task counts on existing projects and sections fill in once the worker has run the rollup backfill.

   **Upgrading from 1.1.0:** seal and deploy the 1.2.0 archive the same way. It adds no trigger and changes no entity, so there is nothing to arm. It declares the `assistant` member, a 15-minute lifetime for the cards the assistant offers for Projects records, and AgentFlow refuses a package with a member it does not read: deploy it to an AgentFlow release that does. Cards already offered keep the lifetime they had.

   **Upgrading from 1.2.0:** seal and deploy the 1.3.0 archive the same way. It adds no trigger, so there is nothing to arm. It offers the skills `create_project` and `bulk_update` to the organization's assistant: the upgrade adds both to the default agent as on-demand skills (named `<installation key>-create-project` and `<installation key>-bulk-update`), so the admin who approves it needs `agent.publish`, and an admin can take either off the assistant in the agent editor. The Task create form gains `checklist` and `origin`, so a card can create a task with its checklist and mark it as made by the assistant. Deploy it to an AgentFlow release that reads `assistant.skills`.

   **Rollups and your own automations.** 1.1.0 adds the task counts on Project and Section as rollups. While an entity carries a rollup, any field-enforcing workflow or agent step that reads a Project or Section record, your organization's own included, sees that record as Unknown and takes its default branch, with no error. Before you upgrade, find your own workflows and agents that branch on a Project's or Section's fields and check what their default branch does.
4. **Share the dashboard.** As the installing admin, share Projects overview with the Project users group. Until then everyone else gets a 404 on it and does not see its launcher entry.
5. **Turn modules on.** On the **API** (not the worker), set `APP_MODULES_ENABLED=true` and restart it. With it off, AgentFlow answers `404 FEATURE_DISABLED` and the sidebar shows no module entries.
6. **Make the projects.** As the manager (a member of Project creators), open **Projects** in the module and press **Tạo project**; section 4 ("Creating a project") says how. Make two projects, with yourself as manager, the member in the members and the collaborator in neither, and give one of them two or three sections. Then, as the member, create two or three tasks in the module (section 4) or on **Entities → Task**.
7. **Open it.** Signed in as anyone in Project users, open the sidebar's **Apps** section: **Projects** folds out into Việc của tôi / My Work, Dự án / Projects, the dashboard and Open tasks. My Work opens `/apps/rfx-projects/`, Projects opens `/apps/rfx-projects/projects`. A person outside Project users does not see the app at all, and one who opens the address is told the app isn't theirs.

## 4. A pass by hand as each role

Use AgentFlow in Vietnamese for at least one pass (the module follows AgentFlow's language switcher without reloading) and in dark mode for another. After each write, reload the page once and check that what you saw is what was stored.

### The manager

1. **My Work:** the two numbers at the top (project tasks in progress where you are primary, workflow tasks waiting) are never summed. The groups are Quá hạn, Hôm nay, Tuần này, Sau tuần này, Chưa có hạn, then Có thể nhận apart.
2. **Projects:** your projects as cards with Chưa làm, Đang làm and Hoàn thành counts; the status filter shows Đang chạy and Tạm dừng by default.
3. **The board:** open a project. Switch Danh sách / Kanban and each Nhóm theo. Grouped by section, the column header reads "<name> · done/total".
4. **A drop:** drag a card to another section, and drag one within a column to reorder; do the same with the keyboard (Tab to the card itself, not a button on it, then Space, the arrows, Space; Escape cancels and leaves an open drawer open). Reload: the order is the one you left. Drop a card into Hoàn thành: refused for everyone, and it snaps back with the reason. Drop one into Đã huỷ (with Hiện task đã huỷ on): it asks first.
5. **The drawer:** open a card. Edit the title, priority, due date and description (bold, a list, a link). Pick a primary, add a collaborator. Escape closes it and the board keeps its scroll; the browser's Back closes it too.
6. **The checklist:** add items, tick one, edit one in place, reorder with ↑ and ↓, delete one, turn on Hiện trên thẻ and see the unticked items on the card. The 21st item is refused ("tối đa 20 mục").
7. **An attachment:** drop an image and a PDF on Tệp đính kèm; each shows its name and size, and the image and the PDF preview in the drawer. The download link downloads.
8. **Quick create:** Tạo task in the header; title and project are required, the project is the one you are in. Add a collaborator and a file. Press Tạo twice quickly: one task is made, at the top of its column.
9. **Lifecycle:** Huỷ task (confirmed), then Khôi phục; Xoá on another task (confirmed). Close the project on its record page: the module shows "Project đã đóng, chỉ đọc" and every write is locked; reopen it there and the tasks are editable again (the unfreeze trigger is armed).
10. **Comments:** under Tệp đính kèm, "Bình luận · N" lists the task's conversation, newest at the bottom. Write one, type `@` and pick a person (only people who can read the task are offered), press Ctrl/⌘+Enter. Edit your own (⋯ → Sửa) and delete one (⋯ → Xoá, confirmed). Attach a file with the paperclip: it appears in Tệp đính kèm tagged "trong bình luận". On a frozen task (its project closed) the thread reads "Task đã đóng băng: không thể bình luận" and has no box. On the standalone site the paperclip is absent (the app's token cannot upload).

### The member

1. My Work lists the tasks you hold and those you collaborate on, each with its role chip; the role chips narrow the list.
2. On the board, Nhận task on an unheld card takes it. Tick a task you hold, from Chưa làm: it completes at once with a toast and no undo.
3. In the drawer the primary picker is not shown, Xoá task is not shown, and Khôi phục and Mở lại are locked with a reason saying only managers may.
4. Quick create: your new task starts with you as its primary.
5. Open the same task as the manager in a second window, change its title there, then save a change here: the drawer says "Task vừa được cập nhật" and shows the manager's version; your change is not written over it.

### The collaborator

1. My Work shows the task you collaborate on under its due group, with the Phối hợp chip.
2. Open it: you can move it between Chưa làm and Đang làm, set Bị chặn, use the checklist and attach a file; the title, description, due date and priority are locked with a reason, and so is the tick.
3. Open the task by its own address, `/apps/rfx-projects/t/<task id>`: since you are not in its project, the drawer's crumb and the page behind it say "Bạn không xem được project này" instead of the project's name, and closing the drawer goes to My Work.

### The project admin

1. Projects lists every project in the organization, including ones you are not in.
2. A task in a project you are not a member of opens, and its edits are locked (an admin oversees projects but is not a member).
3. Close and reopen a project on its record page as admin: allowed.

### The outsider

1. In Project users but in no project: My Work and Projects are empty ("Bạn chưa tham gia project nào").
2. Paste the address of a task in a project you are not in (`/apps/rfx-projects/t/<task id>`): "Không tìm thấy", the same screen as a made-up id, with no title or project name shown.
3. Out of Project users altogether: the sidebar shows no Projects app.

### Creating a project

As a member of Project creators (the manager from section 2 is one).

1. **Projects:** Tạo project is a button for you. As someone outside Project creators it is not offered at all; ask the member to look.
2. **The modal:** the name is focused. Tạo project stays locked, with a reason in its tooltip, until the name has text. You are the first manager, shown as a fixed chip with a lock and no remove control: "Bạn là quản lý của project mình tạo". Add another manager and a member; a person you add as manager leaves the members.
3. **Templates:** the cards on the right are Trống, Dự án phần mềm, Sự kiện / Ra mắt, Theo thời gian, Theo mảng việc and Dùng lại từ project có sẵn. Choose Dự án phần mềm: five sections fill in. Rename one, remove one, add one by typing in the last row and pressing Enter, and reorder with the arrow buttons or Alt+↑/↓. Choose another template: it asks before it replaces sections you edited.
4. **Reuse:** choose Dùng lại từ project có sẵn and pick a project you are in. Its section names, descriptions and order are copied; its tasks are not.
5. **Create:** press Tạo project once. The modal closes, the module opens the new project, and there is no toast. Reload: the project has its managers, members and sections in the order you left, and it is the only project of that name.
6. **A section refused:** this needs a section the server will refuse, which is hard to arrange on a real organization, so try it on the demo (`pnpm dev`, `/projects?demo`) if you want to see it. The modal then says "Đã tạo project, nhưng các mục sau chưa lưu được:", names what was not saved and offers Mở project and Thử lại; Thử lại creates only what is missing.
7. **Leaving it half done:** type a name and press Escape. It asks "Bỏ những gì bạn đã nhập?"; Quay lại keeps your text, Bỏ closes it.

### Editing a project

As the project's manager.

1. In the project's header, the "..." menu holds Chỉnh sửa project, Tạm dừng and Đóng project. A member does not see the menu.
2. **Chỉnh sửa project** opens a drawer beside the board. Change the name (Enter or leaving the field saves; Escape puts the old name back; a blank name saves nothing), the description (bold, a list, a link), the unit and Nhóm mặc định. Each change is written at once, with no toast. Reload: they are stored. Open the project with no `group` in the address: the board groups as you chose.
3. **A stale edit:** open the drawer in a second window as another manager and rename the project there. Back in the first window, change the description: the drawer says "Project vừa được cập nhật" and shows the other manager's name; your change is not written over it.
4. **Tạm dừng** shows a badge and the project stays editable; Tiếp tục clears it. **Đóng project** asks first; afterwards the banner reads "Project đã đóng, chỉ đọc", every write is locked and the menu holds only Mở lại. The banner has a Mở lại button too. As the project admin, Chỉnh sửa project is locked with the managers reason, but closing and reopening work.

### Members

1. Open **Thành viên** on a project. As the manager you see Quản lý and Thành viên with counts, your own row tagged "Bạn", a Thêm thành viên button and a menu on each row. As a member, or as the project admin outside the project, you see the same lists and no controls.
2. **Add:** Thêm thành viên, choose two people, Thêm: both appear in one write. Make one a manager (Đặt làm quản lý) and back (Chuyển thành thành viên): no confirmation.
3. **Remove** another member: it asks "Xoá … khỏi project?" and says they keep the tasks they hold.
4. **The last manager:** while you are the only manager, your own row's Chuyển thành thành viên and Xoá khỏi project are locked, with "Project cần ít nhất một quản lý" in the tooltip. Chuyển quyền quản lý… picks a member and asks "Đặt … làm quản lý? Bạn vẫn ở lại project với vai trò thành viên."; after it you are a member and the tab is read only.
5. **Leaving:** with two managers, use your own row's menu: the item reads "Rời project", and the confirmation says "Rời project này? Bạn vẫn giữ các task đang làm." Afterwards the module opens the project list with "Bạn đã rời project", and the project is gone from it if you were no longer in either list.
6. **Two managers at once:** with manager A and manager B as the only managers, each in their own browser on the Members tab, A demotes B and then B demotes A. B must make the demote before live updates deliver A's change (do it straight away, or turn the network off in B's browser until after A has demoted). B is told "Bạn không có quyền làm việc này" and the screen reloads, because B is no longer a manager; the project keeps one manager.

### Sub-labels

As a member of Project admins.

1. **Projects → Nhãn trạng thái** (a button on the project list, shown to project admins) opens the settings, at `/settings/labels`. Anyone outside Project admins sees "Bạn không có quyền xem trang này".
2. Four groups, in the order Chưa làm, Đang làm, Hoàn thành, Đã huỷ; "Bị chặn" is a row at the end of Đang làm, tagged "Có sẵn", with no buttons.
3. **Add** a label under Đang làm: Thêm nhãn, type a name, Enter. **Rename** it in place (Enter or leaving saves, Escape restores), or with Đổi tên. **Delete** an unused label: it asks, then says "Đã xoá nhãn".
4. **Delete a label that tasks use**, as a project admin who does not manage those projects: the dialog "Không xoá được nhãn này" says how many tasks you cannot edit and that nothing was changed. The label and the tasks are as they were. Đổi tên closes it and selects the label's name.
5. Add yourself as a manager of the project whose task uses the label and delete it again: the toast says "Đã xoá nhãn khỏi 1 task", the task keeps its status and loses only the label, and a task drawer left open on it reloads without the label.

### Once, in Safari

Type Vietnamese with the macOS Telex or VNI input method in the drawer's description and in a checklist item, including a word with a tone mark at the end of a line and one after a bold run. The text must come out as typed, with no doubled or lost characters. The automated tests run WebKit through Playwright but cannot drive an input method, so this is checked only by hand.

## 5. The standalone site

The same module on its own origin, with its own sign-in and Node server (`server/`), the way the support desk's site runs. It is for a team that wants Projects at its own address; inside AgentFlow nothing here is needed. Everything is run from the project's folder. The details of Reflexify Identity and the app registration are in the support desk [RUNBOOK](../support-desk/RUNBOOK.md), "The desk", steps 2 to 8, which this section follows with Projects' names, and in the [Case desk runbook](../case-desk/RUNBOOK.md) steps 1 to 3.

To see the site first, with no backend: `pnpm dev`, then open `http://localhost:5175/?demo`. It runs on sample data and nothing is sent anywhere.

**The site has no ceiling.** It is an app registered under Admin → Apps outside the package, as the desk's site is, so its token carries no ceiling: every call acts as the person, within the person's own permissions, exactly as the embedded module does. Uploads, the unit picker, names and role detection therefore work. The site's server answers `GET /agentflow/api/app/objects` from `projects.config.json`, because AgentFlow lists no objects for a registration without a package. Moving the site to a packaged client under the ceiling is planned; `test/permissions.test.ts` lists the operations that needs opened.

### 5.1 Before you start

- Projects 1.3.0 is installed and armed (section 3), and the embedded module passes section 4.
- The people each have an AgentFlow seat and have signed in to AgentFlow's own web app at least once, or AgentFlow refuses them with `USER_NOT_PROJECTED`.
- You can set the API's environment: `APP_ACCESS_ENABLED=true` on the API and the worker (while it is off, AgentFlow refuses every app's token), and `REALTIME_CHANNEL_ENABLED=true` for live updates (5.6).
- You have `integration.admin` to open **Admin → Apps**.
- Node 22.12 or later and pnpm 12, with `pnpm install` run in the project's folder.

### 5.2 Register the app

1. **Keys.** `pnpm setup-keys` writes `keys/private.pem`, `keys/public.jwk.json` and `keys/registration.json`, and a `.env` from `.env.example` with a fresh `PROJECTS_SESSION_KEY` and `AGENTFLOW_PRIVATE_KEY_ID`. Run it first, and do not run it with `--force` once `.env` holds values you set: it replaces the key and the file. For another origin or client id, set them in the command's environment, because it does not read `.env`: `PROJECTS_ORIGIN=https://projects.example.com AGENTFLOW_CLIENT_ID=projects-prod pnpm setup-keys`, and put the same two values in `.env`.
2. **The identity provider.** Add the REST resource to AgentFlow's own client and register `keys/registration.json`, as the Case desk runbook's step 2 does. The client id defaults to `projects-dev`. The redirect URI is `http://localhost:5175/agentflow/auth/callback`, the post-logout URI `http://localhost:5175/` and the back-channel logout URI `http://localhost:5175/agentflow/auth/backchannel-logout`.
3. **Admin → Apps → Register app**, fill in:
   - **Name:** `Projects`;
   - **Key:** `projects`. Not `rfx-projects`: the package's installation holds that key, and this is a separate registration that happens to show the same module;
   - **Client ID:** `projects-dev`, which must equal `AGENTFLOW_CLIENT_ID` and cannot be changed later;
   - **Who may use it:** **Only chosen people and groups**, with the **Project users** group under **Allowed**.
4. If you want the sidebar's Apps section to link to the site, set the registration's **Launch URL** field to its address. It must start with `https://`, so it applies to a deployed site, not `http://localhost`.

### 5.3 `.env`

Fill in, besides what `setup-keys` wrote:

- `AGENTFLOW_ISSUER`: AgentFlow's `OIDC_ISSUER`;
- `AGENTFLOW_API_BASE_URL`: `http://localhost:8080/api/v1` for a local AgentFlow (the default), `{HTTP_PUBLIC_BASE}/api/v1` for a deployed one;
- `AGENTFLOW_ORG_HINT`: only when a person belongs to several organizations;
- `AGENTFLOW_RESOURCE`: leave blank;
- `AGENTFLOW_APP_URL`: the address of AgentFlow's **web app**, used for the links that leave the site (notifications, the dashboard, Mở form). The default is `http://localhost:4000`; set the deployed address in production;
- `PROJECTS_ORIGIN` and `PORT`: the site's address (default `http://localhost:5175`) and its port;
- leave `PROJECTS_SESSION_KEY`, `AGENTFLOW_PRIVATE_KEY_FILE` and `AGENTFLOW_PRIVATE_KEY_ID` as `setup-keys` wrote them.

### 5.4 `projects.config.json`

The server reads the installed ids from `projects.config.json` (git ignores it; `PROJECTS_CONFIG_FILE` names another file). Copy `projects.config.example.json` and fill it in. The install's receipt holds no object ids. The three group ids are the `project_users`, `project_creators` and `project_admins` values of the `parameters.json` you installed with (section 2). Each entity id is in the address of that entity's page under **Admin → Entities** (Project, Section, Task, Task label), as the support desk's RUNBOOK does for its ids.

```json
{
  "entities": { "project": "…", "section": "…", "task": "…", "task_label": "…" },
  "groups": { "users": "<Project users>", "creators": "<Project creators>", "admins": "<Project admins>" }
}
```

Every id must be a UUID. `GET /agentflow/api/app/objects` on the site is answered from this file, in AgentFlow's shape.

### 5.5 Check

`pnpm doctor` prints one line per check: `configuration`, `identity provider`, `private_key_jwt`, `AgentFlow API`, `projects config` and `live updates`. A missing or malformed value in `.env` or the config file is listed with the others in one `configuration` line, so you can fix them all and run it again until nothing shows a cross. Then `pnpm server` builds the site and starts it (it refuses to start, saying what is missing, only when the configuration is incomplete; it does not run the other checks); open `http://localhost:5175`. Use exactly that address, not `127.0.0.1`: the sign-in cookie belongs to the host name. Both read `.env` when they start, so restart after editing it.

### 5.6 Live updates

The board, the drawer and the lists refresh from AgentFlow's event stream through the site's own proxy. Nothing is set in the site; AgentFlow needs `REALTIME_CHANNEL_ENABLED=true` and a running worker, and a proxy in front must not buffer or compress `text/event-stream`. Open a project in two browsers as two people and change a task title in one: the other shows it within seconds. If the stream drops after it was live, the module shows its offline banner and locks its writes until it is back. Each open tab holds one stream and AgentFlow allows six per person; over HTTP/1.1 a few tabs can use up the browser's connections, so serve the site over HTTP/2 in production and keep to a few tabs in development.

### 5.7 Production

`pnpm server` behind https, on **one instance**: sessions live in that process's memory, so a restart signs everyone out. Register the production origin's three URIs on the client, set `PROJECTS_ORIGIN` to it and `AGENTFLOW_APP_URL` to the web app's address. A reverse proxy must pass `text/event-stream` through unbuffered and uncompressed and must speak HTTP/2 to the browser (Caddy does by default; nginx needs `http2` switched on); the Node server speaks plain HTTP/1.1, so browsers must not reach it directly. The server reads the same `.env` and the `PORT` it names (default 5175).

### 5.8 The walkthrough

This is the real-stack check the Playwright run cannot make: sign-in, the real API and its permissions, and the event stream. Use two people, A (a project creator) and B (a member), in two browsers.

1. Open the site signed out: the sign-in page with "Đăng nhập". Sign in as A; the sign-in returns you to the page you asked for (try a deep link such as `/projects`).
2. A opens Dự án and presses Tạo project, with Dự án phần mềm: the project opens, with five sections. Check the sections and managers on **Entities → Section** and **Entities → Project** in AgentFlow.
3. A adds B as a member in the Members tab. B reloads Dự án: the project is listed.
4. B makes a task in it and attaches a file: the attachment uploads (it would be refused under a ceiling) and previews.
5. A changes the task's title while B has it open: B's drawer shows it within seconds.
6. A opens a link that leaves the site (the dashboard, or Mở form on a workflow task): it opens on AgentFlow's web app at `AGENTFLOW_APP_URL`.
7. As a person outside Project users (so not Allowed on the app's registration), open the site and sign in: you come back to the sign-in page with `?agentflow_error=APP_NOT_ASSIGNED` at the end of the address, and no session is made. The page does not say why, so read the address.
8. Remove `projects.config.json` (or rename it) and start the server: it refuses to start and names the file. Put it back.
9. Stop the server while A has the site open and start it again: A is signed out (sessions live in memory) and signs in again.

### 5.9 Troubleshooting

On the site, a sign-in refusal comes back with the code at the end of the address (`/?agentflow_error=…`) and the Network panel shows it as the `type` of a failed API response. The table in the desk's RUNBOOK ("The desk", step 10) explains each code; these are the ones that differ for Projects.

| Symptom | Cause |
|---|---|
| "Trang này chưa được cấu hình" / "This site is not set up yet" | `/site/config.json` failed or its ids do not parse: the server could not read `projects.config.json`, or a proxy in front sent `/site/` elsewhere. Run `pnpm doctor`. |
| The sign-in page again, with `?agentflow_error=APP_NOT_ASSIGNED` or `APP_NOT_INSTALLED` in the address | The person is outside the groups under **Allowed** on the registration (`APP_NOT_ASSIGNED`), or the client id differs from `AGENTFLOW_CLIENT_ID`, the app is registered in another organization, or its **Enabled** switch is off (`APP_NOT_INSTALLED`). The sign-in page does not say which. |
| "Bạn chưa có quyền dùng Dự án" / "You don't have access to Projects yet", with "Hãy nhờ quản trị viên cấp quyền cho bạn." / "Ask an administrator to give you access." | AgentFlow answered 403 when the site connected, after the person had signed in: the app was switched off, or the person was removed from **Allowed** while signed in. Signing in again or retrying would not mend it, so the page offers neither. A 403 while the module is already open shows the module's own refusal instead (a toast such as "Bạn không có quyền làm việc này", or "Bạn không xem được project này" in place of a project); this page appears on the next load. |
| The site shows the sign-in page again and again for someone who just signed in | The session cookie was not kept: the address in the browser is not `PROJECTS_ORIGIN` (for example `127.0.0.1` instead of `localhost`). |
| `?agentflow_error=INVALID_TOKEN` | `APP_ACCESS_ENABLED` is off, or `AGENTFLOW_RESOURCE` differs from AgentFlow's `API_RESOURCE_URI`. |
| `?agentflow_error=USER_NOT_PROJECTED` | The person has never signed in to AgentFlow's own web app in that organization. |
| "Dự án không kết nối được với AgentFlow" with Thử lại | The site's server cannot reach AgentFlow or the identity provider. It is an outage, not a refusal. |
| Lists fail to load or screens say "Không tìm thấy" although the data exists | `projects.config.json` holds valid UUIDs that are the wrong ones (another organization's, or an entity or group swapped), so reads fail or find nothing. A malformed id stops the server at start, and the site's `/app/objects` answer is built from the file, so the module never reports a missing key here. |
| Uploads, names or the unit picker fail with 403 on the site | The registration has gained a package or a ceiling. The site is meant to run as an app registered outside the package. |
| Live updates never arrive | AgentFlow runs without `REALTIME_CHANNEL_ENABLED=true`, or a proxy buffers the stream (5.6). |

## 6. What is not verified

- Dates follow the viewer's time zone, not the organization's: the published API does not expose the organization's yet.
- Có thể nhận lists only work the platform offers to the person (`GET /work?view=claimable`), which for most members is little or nothing.
- Touch drag on the board.
- A hard break inside a task-list item splits the item when the description is reloaded.
- Freezing and unfreezing act on the event that started them, so a late run can leave a reopened project's tasks frozen; close and reopen the project to recover.
