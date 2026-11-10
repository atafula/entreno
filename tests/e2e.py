#!/usr/bin/env python3
"""Tests end-to-end de Entreno. Uso: python3 tests/e2e.py   (necesita playwright y Chrome)
Se escribe primero el test (rojo), luego el código (verde)."""
import io, json, os, subprocess, sys, time
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8199
URL = f"http://localhost:{PORT}/index.html"
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")

ROUTINES = [
    {"id": "a", "name": "PUSH", "exercises": [
        {"name": "Press de pecho", "sets": [{"w": True, "kg": 20, "reps": 10}, {"w": False, "kg": 39, "reps": 10}, {"w": False, "kg": 41.3, "reps": 10}]},
        {"name": "Aperturas", "sets": [{"w": False, "kg": "", "reps": 8}]}]},
    {"id": "b", "name": "PULL", "exercises": [{"name": "Remo", "sets": [{"w": False, "kg": 30, "reps": 10}]}]},
]
HISTORY = [{"id": "s", "date": "2026-11-01", "routine": "PUSH", "sets": [
    {"exercise": "Press de pecho", "reps": 10, "kg": 39, "w": False}]}]

TESTS = []
def test(f): TESTS.append(f); return f

def seed(pg, routines=ROUTINES, sessions=HISTORY, walks=None, fb=None, prev_uid=None, meta=None):
    """fb: None = sin configurar (modo local). dict = firebase falso: uid, logged (ya con sesión), cloud (datos iniciales)."""
    if fb is not None:
        init = {"uid": fb.get("uid", "U1"), "logged": bool(fb.get("logged")), "cloud": fb.get("cloud", {})}
        pg.add_init_script("""(o => {
            window.ENTRENO_FIREBASE_CONFIG = {apiKey: 'test', projectId: 'entreno-test'};
            window.__fakeUid = o.uid;
            if (!sessionStorage.getItem('fake-cloud')) sessionStorage.setItem('fake-cloud', JSON.stringify(o.cloud));
            if (o.logged && !sessionStorage.getItem('fake-user-set')) { sessionStorage.setItem('fake-user', JSON.stringify({uid: o.uid, email: 'yo@ejemplo.com'})); sessionStorage.setItem('fake-user-set', '1'); }
        })(%s)""" % json.dumps(init))
    # Los ejercicios llevan ejId desde el buscador con foto: sin él, la migración de la app los descarta
    routines = [dict(r, exercises=[dict(e, ejId=e.get("ejId") or "t-" + e["name"]) if isinstance(e, dict) else e for e in r.get("exercises", [])]) for r in routines]
    pg.goto(URL)
    pg.evaluate("([d, u]) => { localStorage.clear(); localStorage.setItem('entreno-v1', JSON.stringify(d)); if (u) localStorage.setItem('entreno-uid', u); }",
                [{"routines": routines, "sessions": sessions, "walks": walks or [], **(meta or {})}, prev_uid])
    pg.reload()
    pg.wait_for_timeout(300)

def cloud(pg): return pg.evaluate("JSON.parse(sessionStorage.getItem('fake-cloud') || '{}')")

def tab(pg, name): pg.click(f'[data-tab="tab-{name}"]')
def db(pg): return pg.evaluate("JSON.parse(localStorage['entreno-v1'])")
def abrir_rutina(pg, id): pg.click(f'[data-open-routine="{id}"]'); pg.wait_for_timeout(100)
def empezar(pg, id): pg.click(f'#routines-list [data-start-routine="{id}"]')
def editar_rutina(pg, id): pg.click(f'#routines-list [data-edit-routine="{id}"]')
EXTRAS = ["Curl", "Remo", "Fondos", "Elevaciones", "Sentadilla", "Press"]  # búsquedas distintas, nombres distintos
def anadir_del_selector(pg, buscar):
    """Entreno o entreno libre: «+ Añadir ejercicio» abre el mismo selector que el editor de rutinas."""
    pg.click("#wk-add-ex"); pg.wait_for_selector("#picker-sheet.show")
    pg.fill("#picker-search", buscar); pg.wait_for_timeout(150)
    pg.locator("#picker-list [data-name]").first.click(); pg.wait_for_timeout(200)

# ---------- Hoy ----------
@test
def hoy_no_tiene_tarjeta_registrar_sesion(pg):
    seed(pg)
    assert "REGISTRAR SESIÓN" not in pg.inner_text("#tab-hoy"), "la tarjeta REGISTRAR SESIÓN sigue en Hoy"
    assert pg.locator("#log-routine, #log-form, #log-save").count() == 0, "quedan restos del formulario antiguo"

# ---------- Rutinas ----------
@test
def rutinas_muestra_boton_crear_y_oculta_editor(pg):
    seed(pg); tab(pg, "rutinas")
    assert pg.is_visible("#new-routine") and not pg.is_visible("#editor-card") and pg.is_visible("#routines-list")

@test
def rutinas_cambiar_de_pantalla_cancela_crear_o_editar(pg):
    seed(pg); tab(pg, "rutinas")
    pg.click("#new-routine"); assert pg.is_visible("#editor-card")
    tab(pg, "historial"); tab(pg, "rutinas"); pg.wait_for_timeout(300)
    assert not pg.is_visible("#editor-card"), "al cambiar de pantalla se cancela la creación"
    editar_rutina(pg, "a"); assert pg.is_visible("#editor-card")
    tab(pg, "hoy"); tab(pg, "rutinas"); pg.wait_for_timeout(300)
    assert not pg.is_visible("#editor-card"), "al cambiar de pantalla se cancela la edición"
    assert pg.is_visible("#routines-list"), "vuelve la lista de rutinas"

@test
def rutinas_crear_y_guardar(pg):
    seed(pg); tab(pg, "rutinas")
    pg.click("#new-routine")
    assert pg.is_visible("#editor-card") and not pg.is_visible("#new-routine") and not pg.is_visible("#routines-list")
    pg.fill("#routine-name", "LEG")
    pg.click("#add-exercise"); pg.wait_for_selector("#picker-sheet.show", timeout=2000)
    pg.fill("#picker-search", "Sentadilla"); pg.wait_for_timeout(200)
    pg.locator("#picker-list .picker-custom").click(); pg.wait_for_timeout(300)
    pg.click("#routine-save")
    assert [r["name"] for r in db(pg)["routines"]] == ["PUSH", "PULL", "LEG"]
    assert pg.is_visible("#new-routine") and not pg.is_visible("#editor-card")

@test
def rutinas_editar_oculta_el_resto(pg):
    seed(pg); tab(pg, "rutinas")
    editar_rutina(pg, "a")
    assert pg.is_visible("#editor-card") and not pg.is_visible("#routines-list")
    pg.click("#editor-cancel")
    assert pg.is_visible("#routines-list")

@test
def rutinas_borrar_pide_confirmacion_roja_sin_dialogo(pg):
    dialogs = []; pg.on("dialog", lambda d: (dialogs.append(d), d.dismiss()))
    seed(pg); tab(pg, "rutinas"); editar_rutina(pg, "b")
    pg.click("#routine-delete")
    assert "armed" in pg.get_attribute("#routine-delete", "class") and len(db(pg)["routines"]) == 2
    pg.click("#routine-delete")
    assert [r["id"] for r in db(pg)["routines"]] == ["a"] and not dialogs
    assert not pg.is_visible("#editor-card") and pg.is_visible("#routines-list")

# ---------- Entreno en vivo ----------
@test
def entreno_empezar_marcar_descanso_y_terminar(pg):
    seed(pg); tab(pg, "rutinas")
    empezar(pg, "a")
    assert pg.is_visible("#workout") and pg.inner_text("#wk-sets") == "0"
    chk = pg.locator(".wrow .chk")
    chk.nth(1).click(); chk.nth(2).click()
    assert pg.inner_text("#wk-sets") == "2"
    assert pg.inner_text("#wk-vol").replace(".", "").replace(",", "") in ("803", "8030"), pg.inner_text("#wk-vol")
    assert pg.is_visible("#rest") and pg.inner_text("#rest-time") == "2:00"
    pg.click("#rest-plus")
    m, sec = pg.inner_text("#rest-time").split(":"); left = int(m) * 60 + int(sec)
    assert 133 <= left <= 135, f"descanso tras +15 = {left}s"   # 120 + 15 menos lo que haya corrido el reloj
    pg.click("#rest-skip"); assert not pg.is_visible("#rest")
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(300)
    d = db(pg)
    assert len(d["sessions"]) == 2 and len(d["sessions"][-1]["sets"]) == 2 and not pg.is_visible("#workout")
    assert pg.evaluate("localStorage['entreno-live']") == ""

@test
def entreno_sin_series_se_descarta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.click("#wk-finish"); pg.wait_for_timeout(300)
    assert len(db(pg)["sessions"]) == 1, "no se guarda nada"
    assert not pg.is_visible("#workout") and pg.evaluate("localStorage['entreno-live']") == "", "el entreno se descarta"
    assert not pg.is_visible("#wk-resume"), "ya no hay entreno en curso"
    assert pg.inner_text("#toast").strip().rstrip(".").lower() == "entrenamiento descartado", pg.inner_text("#toast")

@test
def entreno_sobrevive_a_recarga_y_minimizar(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-min"); assert not pg.is_visible("#workout") and pg.is_visible("#wk-resume")
    pg.click("#wk-back"); assert pg.is_visible("#workout")
    pg.reload(); pg.wait_for_timeout(300)
    assert pg.is_visible("#workout") and pg.inner_text("#wk-sets") == "1"

@test
def entreno_sin_series_terminar_descarta_directo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.click("#wk-finish"); pg.wait_for_timeout(300)
    assert not pg.is_visible("#workout") and not pg.is_visible("#finish-sheet"), "sin series no pregunta"
    assert len(db(pg)["sessions"]) == 1

@test
def entreno_se_ve_en_el_historial(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "b")
    pg.locator(".wrow .chk").first.click(); pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(2300)
    pg.click("#summary-done"); pg.wait_for_timeout(500)
    tab(pg, "historial")
    assert "PULL" in pg.inner_text("#history-list")

@test
def sin_emojis_en_empezar_y_descanso(pg):
    seed(pg, sessions=[]); tab(pg, "rutinas")
    assert pg.inner_text('[data-start-routine="a"]').strip() == "Comenzar", pg.inner_text('[data-start-routine="a"]')
    empezar(pg, "a")
    assert pg.inner_text(".chip").strip().startswith("Descanso:"), pg.inner_text(".chip")

@test
def banner_entreno_en_curso_no_se_solapa_con_crear_rutina(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a"); pg.click("#wk-min")
    a = pg.locator("#wk-resume").bounding_box(); b = pg.locator("#new-routine").bounding_box()
    assert b["y"] - (a["y"] + a["height"]) >= 8, f"separación {b['y'] - (a['y'] + a['height'])}px entre el banner y CREAR RUTINA"

@test
def entreno_terminar_pregunta_guardar_o_descartar(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.wait_for_timeout(400)
    assert pg.is_visible("#finish-sheet"), "con series hechas, Terminar pregunta"
    assert pg.is_visible("#workout") and len(db(pg)["sessions"]) == 1, "no guarda ni cierra hasta elegir"
    assert pg.inner_text("#finish-save").strip() == "Guardar entreno"
    assert pg.inner_text("#finish-discard").strip() == "Descartar"
    assert "1 serie hecha" in pg.inner_text("#finish-sheet"), pg.inner_text("#finish-sheet")
    assert pg.locator("#wk-discard").count() == 0, "ya no hay botón Descartar entreno abajo"

@test
def entreno_descartar_en_la_pregunta_es_solo_texto(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.wait_for_timeout(400)
    st = pg.evaluate("""() => { const s = getComputedStyle(document.getElementById('finish-discard'));
        return { border: s.borderTopWidth, shadow: s.boxShadow, bg: s.backgroundColor }; }""")
    assert st["border"] == "0px" and st["shadow"] == "none" and st["bg"] in ("rgba(0, 0, 0, 0)", "transparent"), f"Descartar debe ser solo texto: {st}"

@test
def entreno_pregunta_cancelar_arriba_sin_volver_abajo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.wait_for_timeout(400)
    assert pg.inner_text("#finish-cancel").strip() == "Cancelar", pg.inner_text("#finish-cancel")
    assert pg.evaluate("document.getElementById('finish-cancel').closest('.sheet-head') !== null"), "Cancelar va en la cabecera"
    assert pg.locator("#finish-sheet button", has_text="Volver").count() == 0, "ya no hay Volver abajo"
    assert pg.evaluate("document.getElementById('finish-discard').className.includes('link')"), "Descartar es solo texto"

@test
def entreno_descartar_pide_confirmacion_en_la_pregunta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.click("#finish-discard"); pg.wait_for_timeout(300)
    assert "¿Seguro?" in pg.inner_text("#finish-discard"), pg.inner_text("#finish-discard")
    assert pg.is_visible("#finish-sheet") and pg.is_visible("#workout"), "no descarta con el primer toque"
    pg.click("#finish-cancel"); pg.wait_for_timeout(700)
    pg.click("#wk-finish"); pg.wait_for_timeout(300)
    assert pg.inner_text("#finish-discard").strip() == "Descartar", "al reabrir vuelve el texto normal"

@test
def entreno_guardar_desde_la_pregunta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(500)
    assert len(db(pg)["sessions"]) == 2 and not pg.is_visible("#workout")
    assert not pg.is_visible("#finish-sheet")
    pg.wait_for_selector("#summary-sheet.show", timeout=5000)
    assert pg.is_visible("#summary-sheet"), "tras guardar se ve el resumen"

@test
def entreno_descartar_desde_la_pregunta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.click("#finish-discard"); pg.wait_for_timeout(300)
    assert pg.is_visible("#finish-sheet") and len(db(pg)["sessions"]) == 1, "el primer toque sólo pide confirmación"
    pg.click("#finish-discard"); pg.wait_for_timeout(700)
    assert len(db(pg)["sessions"]) == 1, "descartar no guarda nada"
    assert not pg.is_visible("#workout") and not pg.is_visible("#finish-sheet")
    assert "Entrenamiento descartado." in pg.content()

@test
def entreno_volver_desde_la_pregunta_sigue_el_entreno(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.click("#finish-cancel"); pg.wait_for_timeout(700)
    assert not pg.is_visible("#finish-sheet") and pg.is_visible("#workout")
    assert len(db(pg)["sessions"]) == 1

@test
def rscreen_cabecera_a_todo_el_ancho(pg):
    seed(pg); tab(pg, "rutinas"); pg.click('[data-open-routine="a"]'); pg.wait_for_timeout(400)
    b = pg.locator("#rscreen .wk-top").bounding_box()
    assert b["x"] <= 0.5 and abs(b["width"] - 390) <= 1, f"la cabecera de la rutina debe ocupar todo el ancho: {b}"

# ---------- Cuenta y sincronización (Firebase) ----------
def abrir_ajustes(pg):
    if pg.get_attribute("#settings-sheet", "aria-hidden") != "false":
        pg.click("#settings-btn"); pg.wait_for_timeout(300)
def iniciar_sesion(pg):
    abrir_ajustes(pg); pg.click("#login-btn"); pg.wait_for_timeout(700)
    pg.click("#settings-close"); pg.wait_for_timeout(400)

@test
def sync_con_las_claves_reales_muestra_la_cuenta(pg):
    seed(pg); abrir_ajustes(pg)
    assert pg.is_visible("#login-btn"), "con las claves de entreno-31153 debe ofrecer iniciar sesión"
    cfg = pg.evaluate("FIREBASE_CONFIG")
    assert cfg["projectId"] == "entreno-31153" and cfg["authDomain"] == "entreno-31153.firebaseapp.com"
    assert cfg["apiKey"].startswith("AIza") and cfg["appId"].startswith("1:229443527410:web:")

@test
def sync_sin_claves_oculta_la_cuenta(pg):
    pg.add_init_script("window.ENTRENO_FIREBASE_CONFIG = {apiKey: 'REEMPLAZA'}")
    seed(pg); abrir_ajustes(pg)
    assert not pg.is_visible("#login-btn"), "sin claves no debe ofrecer iniciar sesión"

@test
def sync_solo_un_boton_de_cuenta_a_la_vez(pg):
    seed(pg, fb={}); abrir_ajustes(pg)
    assert pg.is_visible("#login-btn") and not pg.is_visible("#logout-btn"), "sin sesión: solo SINCRONIZAR CON GOOGLE"
    pg.click("#login-btn"); pg.wait_for_timeout(700)
    assert pg.is_visible("#logout-btn") and not pg.is_visible("#login-btn"), "con sesión: solo CAMBIAR DE CUENTA"

@test
def sync_login_sube_los_datos_locales(pg):
    seed(pg, walks=[{"id": "w1", "date": "2026-11-02", "seconds": 1200, "meters": 1500}], fb={})
    iniciar_sesion(pg)
    c = cloud(pg)
    assert [r["name"] for r in c["users/U1"]["rutinas"]] == ["PUSH", "PULL"], c.keys()
    assert "users/U1/sesiones/s" in c and c["users/U1/sesiones/s"]["routine"] == "PUSH" and "id" not in c["users/U1/sesiones/s"]
    assert c["users/U1/caminatas/w1"]["meters"] == 1500

@test
def sync_login_baja_los_datos_de_la_nube(pg):
    cl = {"users/U1": {"rutinas": [{"id": "z", "name": "NUBE", "exercises": [{"name": "Dominadas", "sets": [{"w": False, "kg": "", "reps": 8}]}]}], "rutinasTs": 5},
          "users/U1/sesiones/n1": {"date": "2026-10-30", "routine": "NUBE", "sets": [{"exercise": "Dominadas", "reps": 8, "kg": 0, "w": False}], "seconds": 60},
          "users/U1/caminatas/n2": {"date": "2026-10-31", "seconds": 600, "meters": 800}}
    seed(pg, routines=[], sessions=[], fb={"cloud": cl})
    iniciar_sesion(pg)
    d = db(pg)
    assert [r["name"] for r in d["routines"]] == ["NUBE"] and [s["id"] for s in d["sessions"]] == ["n1"] and [w["id"] for w in d["walks"]] == ["n2"]
    tab(pg, "rutinas"); assert "NUBE" in pg.inner_text("#routines-list")

@test
def sync_cambio_de_cuenta_limpia_lo_local(pg):
    seed(pg, fb={"uid": "U2"}, prev_uid="U1")
    iniciar_sesion(pg)
    d = db(pg)
    assert d["routines"] == [] and d["sessions"] == [], "los datos de la cuenta anterior no deben mezclarse"
    assert pg.evaluate("localStorage.getItem('entreno-uid')") == "U2"

@test
def sync_rutina_nueva_sube_a_la_nube(pg):
    seed(pg, fb={"logged": True}); tab(pg, "rutinas")
    pg.click("#new-routine"); pg.fill("#routine-name", "LEG")
    pg.click("#add-exercise"); pg.wait_for_selector("#picker-sheet.show", timeout=2000)
    pg.fill("#picker-search", "Sentadilla"); pg.wait_for_timeout(200)
    pg.locator("#picker-list .picker-custom").click(); pg.wait_for_timeout(300)
    pg.click("#routine-save"); pg.wait_for_timeout(900)
    assert [r["name"] for r in cloud(pg)["users/U1"]["rutinas"]] == ["PUSH", "PULL", "LEG"]

@test
def sync_borrar_rutina_se_propaga(pg):
    seed(pg, fb={"logged": True}); tab(pg, "rutinas"); editar_rutina(pg, "b")
    pg.click("#routine-delete"); pg.click("#routine-delete"); pg.wait_for_timeout(900)
    assert [r["id"] for r in cloud(pg)["users/U1"]["rutinas"]] == ["a"]

@test
def sync_entreno_terminado_sube_a_la_nube(pg):
    seed(pg, fb={"logged": True}); tab(pg, "rutinas"); empezar(pg, "b")
    pg.locator(".wrow .chk").first.click(); pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(900)
    nuevas = [v for k, v in cloud(pg).items() if "/sesiones/" in k and v["routine"] == "PULL"]
    assert len(nuevas) == 1 and nuevas[0]["sets"][0]["exercise"] == "Remo"

@test
def sync_la_nube_mas_reciente_gana_en_rutinas(pg):
    cl = {"users/U1": {"rutinas": [{"id": "z", "name": "NUBE", "exercises": []}], "rutinasTs": 9999999999999}}
    seed(pg, fb={"logged": True, "cloud": cl}); pg.wait_for_timeout(600)
    assert [r["name"] for r in db(pg)["routines"]] == ["NUBE"]

@test
def sync_local_antiguo_sin_marca_no_pisa_la_nube(pg):
    cl = {"users/U1": {"rutinas": [{"id": "z", "name": "NUBE", "exercises": []}], "rutinasTs": 7}}
    seed(pg, fb={"logged": True, "cloud": cl}); pg.wait_for_timeout(700)
    assert [r["name"] for r in db(pg)["routines"]] == ["NUBE"], "lo que ya está en la nube manda sobre datos locales sin fecha"

@test
def sync_lo_local_mas_reciente_gana_en_rutinas(pg):
    cl = {"users/U1": {"rutinas": [{"id": "z", "name": "VIEJA", "exercises": []}], "rutinasTs": 1}}
    seed(pg, fb={"logged": True, "cloud": cl}, meta={"routinesTs": 5000}); pg.wait_for_timeout(900)
    assert [r["name"] for r in db(pg)["routines"]] == ["PUSH", "PULL"]
    assert [r["name"] for r in cloud(pg)["users/U1"]["rutinas"]] == ["PUSH", "PULL"]

# ---------- Copia de seguridad ----------
def copia(routines=None, sessions=None, walks=None, app="forja", **extra):
    return json.dumps({"app": app, "version": 1, "routines": routines or [], "sessions": sessions or [], "walks": walks or [], **extra})

def restaurar(pg, contenido):
    abrir_ajustes(pg)
    pg.set_input_files("#backup-file", files=[{"name": "copia.json", "mimeType": "application/json", "buffer": contenido.encode()}])
    pg.wait_for_timeout(500)

@test
def copia_descargar_json(pg):
    seed(pg); abrir_ajustes(pg)
    with pg.expect_download() as dl: pg.click("#backup-export")
    name = dl.value.suggested_filename
    assert name.startswith("forja-") and name.endswith(".json"), name
    data = json.loads(open(dl.value.path()).read())
    assert data["app"] == "forja" and len(data["routines"]) == 2 and len(data["sessions"]) == 1 and data["walks"] == []

@test
def copia_restaurar_mezcla_sin_borrar(pg):
    seed(pg, routines=[ROUTINES[0], ROUTINES[1]])
    nueva = {"id": "z", "name": "LEG", "exercises": [{"name": "Sentadilla", "sets": [{"w": False, "kg": 60, "reps": 5}]}]}
    a2 = {**ROUTINES[0], "name": "PUSH 2"}
    ses = {"id": "s2", "date": "2026-11-05", "routine": "LEG", "sets": [{"exercise": "Sentadilla", "reps": 5, "kg": 60, "w": False}], "seconds": 900}
    walk = {"id": "w9", "date": "2026-11-04", "seconds": 600, "meters": 700}
    restaurar(pg, copia(routines=[a2, nueva], sessions=[ses], walks=[walk]))
    d = db(pg)
    assert [r["name"] for r in d["routines"]] == ["PUSH 2", "PULL", "LEG"], [r["name"] for r in d["routines"]]
    assert sorted(x["id"] for x in d["sessions"]) == ["s", "s2"] and [w["id"] for w in d["walks"]] == ["w9"]
    assert "copia restaurada" in pg.inner_text("#toast").lower(), pg.inner_text("#toast")

@test
def copia_restaurar_rechaza_archivos_ajenos(pg):
    seed(pg)
    for malo in ['{"foo": 1}', '[{"importe": 5, "categoria": "x", "fecha": "2026-01-01"}]', "esto no es json"]:
        restaurar(pg, malo)
        assert "no es una copia de forja" in pg.inner_text("#toast").lower(), malo
        assert len(db(pg)["routines"]) == 2 and len(db(pg)["sessions"]) == 1
        pg.wait_for_timeout(2600)

@test
def copia_restaurar_ignora_datos_invalidos(pg):
    seed(pg, routines=[], sessions=[])
    buena = {"id": "ok", "name": "BUENA", "exercises": [{"name": "Press", "sets": [{"w": False, "kg": 10, "reps": 5}]}]}
    sin_nombre = {"id": "x", "exercises": []}
    ses_mala = {"id": "m", "date": "ayer", "routine": "X", "sets": []}
    ses_rara = {"id": "r", "date": "2026-11-01", "routine": "X", "sets": [{"exercise": "Press", "reps": "mucho", "kg": 1, "w": False}]}
    ses_ok = {"id": "g", "date": "2026-11-01", "routine": "X", "sets": [{"exercise": "Press", "reps": 5, "kg": 10, "w": False}]}
    restaurar(pg, copia(routines=[buena, sin_nombre], sessions=[ses_mala, ses_rara, ses_ok]))
    d = db(pg)
    assert [r["id"] for r in d["routines"]] == ["ok"] and [x["id"] for x in d["sessions"]] == ["g"], d

@test
def copia_exportar_csv(pg):
    seed(pg, sessions=[{"id": "s", "date": "2026-11-01", "routine": "PUSH", "sets": [{"exercise": "Press de pecho", "reps": 10, "kg": 41.3, "w": False}, {"exercise": "Press de pecho", "reps": 12, "kg": 20, "w": True}]}],
         walks=[{"id": "w", "date": "2026-11-02", "seconds": 1200, "meters": 1500}])
    abrir_ajustes(pg)
    with pg.expect_download() as dl: pg.click("#backup-csv")
    assert dl.value.suggested_filename.startswith("forja-") and dl.value.suggested_filename.endswith(".csv")
    txt = open(dl.value.path(), encoding="utf-8").read()
    assert txt.startswith("\ufeff"), "falta el BOM para que Excel lea las tildes"
    filas = txt.lstrip("\ufeff").strip().split("\n")
    assert filas[0] == '"fecha";"tipo";"rutina";"ejercicio";"serie";"calentamiento";"kg";"reps";"minutos";"metros"', filas[0]
    assert '"2026-11-01";"entreno";"PUSH";"Press de pecho";"1";"";"41,3";"10";"";""' in filas
    assert '"2026-11-01";"entreno";"PUSH";"Press de pecho";"";"sí";"20";"12";"";""' in filas
    assert '"2026-11-02";"caminata";"";"";"";"";"";"";"20";"1500"' in filas

@test
def copia_restaurar_se_sube_a_la_nube(pg):
    seed(pg, fb={"logged": True}); pg.wait_for_timeout(500)
    ses = {"id": "s2", "date": "2026-11-05", "routine": "LEG", "sets": [{"exercise": "Sentadilla", "reps": 5, "kg": 60, "w": False}]}
    nueva = {"id": "z", "name": "LEG", "exercises": []}
    restaurar(pg, copia(routines=[nueva], sessions=[ses])); pg.wait_for_timeout(900)
    c = cloud(pg)
    assert "users/U1/sesiones/s2" in c and "LEG" in [r["name"] for r in c["users/U1"]["rutinas"]]

@test
def copia_el_apartado_se_ve_en_ajustes(pg):
    seed(pg); abrir_ajustes(pg)
    assert "Copia de seguridad" in pg.inner_text("#settings-sheet")
    assert pg.is_visible("#backup-export") and pg.is_visible("#backup-import") and pg.is_visible("#backup-csv")

@test
def ajustes_botones_y_secciones_con_separacion(pg):
    seed(pg); abrir_ajustes(pg)
    box = lambda sel: pg.locator(sel).bounding_box()
    for a, b in [("#backup-export", "#backup-import"), ("#backup-import", "#backup-csv")]:
        gap = box(b)["y"] - (box(a)["y"] + box(a)["height"])
        assert gap >= 6, f"{a} y {b} están pegados ({gap}px)"
    for nota, sig in [(".sec .note >> nth=0", "#backup-sec h4"), ("#backup-sec .note", "#account-sec h4")]:
        gap = box(sig)["y"] - (box(nota)["y"] + box(nota)["height"])
        assert gap >= 16, f"falta aire entre secciones antes de {sig} ({gap}px)"

@test
def caminata_empezar_ya_sin_flecha(pg):
    seed(pg)
    assert pg.locator("#walk-start svg").count() == 0, "EMPEZAR YA no debe llevar icono"
    assert pg.inner_text("#walk-start").strip() == "Empezar ya"

@test
def caminata_boton_parado_dice_rendirse(pg):
    seed(pg)
    assert pg.inner_text("#walk-finish").strip() == "Rendirse"
    pg.evaluate("document.getElementById('walk-finish').textContent = 'TERMINAR'; resetFinishBtn()")
    assert pg.inner_text("#walk-finish").strip() == "Rendirse", "al reiniciarse también debe decir RENDIRSE"

@test
def semana_dia_cumplido_usa_el_mismo_check_que_las_series(pg):
    seed(pg)
    pg.evaluate("db.walks.push({id: 't', date: localDate(), seconds: 1, meters: 1}); persist()")
    pg.wait_for_timeout(300)
    hoy = pg.locator(".day.today.on i")
    assert hoy.count() == 1
    assert "✓" not in hoy.inner_text(), "debe ser el icono, no el carácter ✓"
    assert hoy.locator("svg path").get_attribute("d") == pg.locator(".chk path, .sx path").first.get_attribute("d") or hoy.locator("svg path").get_attribute("d") == "M5 13l4 4L19 7"
    b, c = hoy.bounding_box(), hoy.locator("svg").bounding_box()
    assert abs((c["x"] + c["width"] / 2) - (b["x"] + b["width"] / 2)) < 2, "el check debe ir centrado"

@test
def entreno_anterior_indica_kg_y_reps(pg):
    ses = [{"id": "p", "date": "2026-11-01", "routine": "PUSH", "sets": [
        {"exercise": "Press de pecho", "reps": 10, "kg": 41.3, "w": False}, {"exercise": "Aperturas", "reps": 8, "kg": 0, "w": False}]}]
    seed(pg, sessions=ses); tab(pg, "rutinas"); empezar(pg, "a")
    prev = pg.locator(".wprev")
    assert prev.nth(0).inner_text().strip() == "41.3 kg × 10", prev.nth(0).inner_text()
    assert prev.nth(1).inner_text().strip() == "—", "sin serie anterior se queda en guion"
    assert prev.nth(3).inner_text().strip() == "8 reps", prev.nth(3).inner_text()

@test
def entreno_anterior_largo_cabe_en_su_columna(pg):
    ses = [{"id": "p", "date": "2026-11-01", "routine": "PUSH", "sets": [{"exercise": "Press de pecho", "reps": 10, "kg": 100.5, "w": False}]}]
    seed(pg, sessions=ses); tab(pg, "rutinas"); empezar(pg, "a")
    r = pg.evaluate("(() => { const e = document.querySelector('.wprev'), n = e.nextElementSibling, b = e.getBoundingClientRect(), nb = n.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(e); const t = range.getBoundingClientRect(); return {textL: t.left, textR: t.right, colL: b.left, colR: b.right, nextL: nb.left}; })()")
    assert r["textL"] >= r["colL"] - 0.5 and r["textR"] <= r["nextL"] - 4, f"el texto de ANTERIOR se sale de su columna: {r}"

@test
def rutinas_vienen_compactas_con_resumen(pg):
    seed(pg); tab(pg, "rutinas")
    card = pg.locator(".routine").first
    txt = card.inner_text().lower()
    assert "2 ejercicios" in txt and "4 series" in txt, txt
    assert pg.locator("#routines-list .rex").count() == 0, "los ejercicios van en la pantalla de detalle"
    assert card.bounding_box()["height"] <= 190, f"tarjeta demasiado alta: {card.bounding_box()['height']}px"
    assert [t.strip() for t in card.locator(".btn").all_inner_texts()] == ["Comenzar", "Editar"], "COMENZAR primero, y sin BORRAR (está en el editor)"

@test
def rutinas_borrar_confirmacion_cabe_en_el_boton(pg):
    seed(pg); tab(pg, "rutinas"); editar_rutina(pg, "a")
    pg.click("#routine-delete")
    fits = pg.evaluate("(() => { const b = document.querySelector('#routine-delete'); const r = document.createRange(); r.selectNodeContents(b); const t = r.getBoundingClientRect(), bb = b.getBoundingClientRect(); return t.left >= bb.left && t.right <= bb.right; })()")
    assert fits, "¿SEGURO? no cabe en BORRAR"

@test
def sin_zoom_por_doble_toque(pg):
    seed(pg)
    OK = ("pan-x pan-y", "manipulation")   # pan-x pan-y bloquea además el pellizco
    assert pg.evaluate("getComputedStyle(document.body).touchAction") in OK
    for sel in ["#walk-start", ".tabbar button", "#settings-btn"]:
        assert pg.evaluate("s => getComputedStyle(document.querySelector(s)).touchAction", sel) in OK, sel
    assert "maximum-scale=1" in pg.get_attribute('meta[name="viewport"]', "content")
    tab(pg, "rutinas"); pg.click("#new-routine")
    chicos = pg.evaluate("[...document.querySelectorAll('input, select, textarea')].filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).map(e => e.id || e.className)")
    assert not chicos, f"campos con letra menor de 16px (iOS hace zoom al enfocarlos): {chicos}"

@test
def sin_barra_lateral(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    for sel in ["html", "#workout", "#settings-sheet"]:
        assert pg.evaluate("s => getComputedStyle(document.querySelector(s)).scrollbarWidth", sel) == "none", f"{sel} muestra barra lateral"
        assert pg.evaluate("s => getComputedStyle(document.querySelector(s), '::-webkit-scrollbar').display", sel) == "none", f"{sel} (webkit) muestra barra lateral"

@test
def sin_zoom_con_dos_dedos(pg):
    seed(pg)
    for ev in ["gesturestart", "gesturechange", "gestureend"]:
        prevented = pg.evaluate("n => { const e = new Event(n, {cancelable: true, bubbles: true}); document.body.dispatchEvent(e); return e.defaultPrevented; }", ev)
        assert prevented, f"{ev} debe cancelarse para que no haga zoom el pellizco"
    # un toque normal no debe verse afectado
    assert pg.evaluate("(() => { const e = new Event('click', {cancelable: true, bubbles: true}); document.body.dispatchEvent(e); return e.defaultPrevented; })()") is False

# ---------- Borrar del historial ----------
def menu(pg, kind, id):
    pg.click(f'[data-menu="{kind}:{id}"]'); pg.wait_for_timeout(120)
SESIONES = HISTORY + [{"id": "s2", "date": "2026-11-03", "routine": "PULL", "sets": [{"exercise": "Remo", "reps": 10, "kg": 30, "w": False}]}]
CAMINATAS = [{"id": "w1", "date": "2026-11-02", "seconds": 1200, "meters": 1500}]

@test
def historial_acciones_van_en_un_menu_de_tres_puntos(pg):
    seed(pg, sessions=SESIONES, walks=CAMINATAS); tab(pg, "historial")
    assert pg.locator("#history-list .eactions").count() == 0, "ya no hay barra de botones Editar/Borrar"
    assert pg.locator('#history-list [data-edit-session]:visible, #history-list [data-del-session]:visible').count() == 0, "cerrado: no se ven Editar/Borrar"
    assert pg.locator("#history-list [data-menu]").count() == 3, "un botón ⋯ por tarjeta (2 entrenos + 1 caminata)"
    b = pg.locator('[data-menu="session:s2"]').bounding_box()
    assert b["width"] >= 40 and b["height"] >= 40, f"zona táctil del ⋯ pequeña: {b}"
    assert pg.get_attribute('[data-menu="session:s2"]', "aria-label") == "Más opciones"
    card = pg.locator("#history-list .entry", has=pg.locator('[data-menu="session:s2"]')).bounding_box()
    assert b["x"] + b["width"] <= card["x"] + card["width"] + 1 and b["y"] <= card["y"] + 30, "el ⋯ va arriba a la derecha de la tarjeta"
    menu(pg, "session", "s2")
    assert [t.strip() for t in pg.locator("#history-list .entry-menu button").all_inner_texts()] == ["Editar", "Borrar"]
    m = pg.locator("#history-list .entry-menu").bounding_box()
    assert m["x"] >= 0 and m["x"] + m["width"] <= 390 and m["y"] >= 0, f"el menú se sale de la pantalla: {m}"
    assert pg.locator("#history-list .entry-menu").count() == 1
    menu(pg, "walk", "w1")
    assert pg.locator("#history-list .entry-menu").count() == 1, "solo un menú abierto a la vez"
    pg.click("#stats", position={"x": 5, "y": 5}); pg.wait_for_timeout(120)
    assert pg.locator("#history-list .entry-menu").count() == 0, "tocar fuera cierra el menú"
    menu(pg, "session", "s2"); menu(pg, "session", "s2")
    assert pg.locator("#history-list .entry-menu").count() == 0, "tocar el ⋯ otra vez lo cierra"

@test
def historial_borrar_entreno_con_confirmacion_roja(pg):
    dialogs = []; pg.on("dialog", lambda d: (dialogs.append(d), d.dismiss()))
    seed(pg, sessions=SESIONES); tab(pg, "historial"); menu(pg, "session", "s2")
    pg.click('[data-del-session="s2"]')
    assert "armed" in pg.get_attribute('[data-del-session="s2"]', "class") and pg.inner_text('[data-del-session="s2"]').strip() == "¿Seguro?"
    assert len(db(pg)["sessions"]) == 2, "no debe borrar al primer toque"
    pg.click('[data-del-session="s2"]')
    assert [x["id"] for x in db(pg)["sessions"]] == ["s"] and not dialogs
    assert pg.locator('[data-del-session="s2"]').count() == 0
    assert pg.inner_text("#stats").split("\n")[0].strip() == "1", pg.inner_text("#stats")

@test
def historial_borrar_se_desarma_solo(pg):
    seed(pg, sessions=SESIONES); tab(pg, "historial"); menu(pg, "session", "s")
    pg.click('[data-del-session="s"]'); pg.wait_for_timeout(3300)
    assert pg.inner_text('[data-del-session="s"]').strip() == "Borrar" and len(db(pg)["sessions"]) == 2

@test
def historial_borrar_caminata(pg):
    seed(pg, walks=CAMINATAS); tab(pg, "historial"); menu(pg, "walk", "w1")
    pg.click('[data-del-walk="w1"]'); pg.click('[data-del-walk="w1"]')
    assert db(pg)["walks"] == []

@test
def sync_borrar_entreno_lo_borra_de_la_nube(pg):
    seed(pg, sessions=SESIONES, fb={"logged": True}); pg.wait_for_timeout(900)
    assert "users/U1/sesiones/s2" in cloud(pg)
    tab(pg, "historial"); menu(pg, "session", "s2"); pg.click('[data-del-session="s2"]'); pg.click('[data-del-session="s2"]'); pg.wait_for_timeout(900)
    assert "users/U1/sesiones/s2" not in cloud(pg) and "users/U1/sesiones/s" in cloud(pg)

@test
def sync_lo_borrado_no_resucita_tras_recargar(pg):
    seed(pg, sessions=SESIONES, fb={"logged": True}); pg.wait_for_timeout(900)
    tab(pg, "historial"); menu(pg, "session", "s2"); pg.click('[data-del-session="s2"]'); pg.click('[data-del-session="s2"]'); pg.wait_for_timeout(900)
    pg.reload(); pg.wait_for_timeout(900)
    assert [x["id"] for x in db(pg)["sessions"]] == ["s"] and "users/U1/sesiones/s2" not in cloud(pg)

@test
def sync_borrado_hecho_sin_sesion_no_resucita_al_entrar(pg):
    cl = {"users/U1/sesiones/s2": {"date": "2026-11-03", "routine": "PULL", "sets": []}}
    seed(pg, sessions=[], fb={"cloud": cl}, prev_uid="U1", meta={"deleted": {"sesiones": ["s2"], "caminatas": []}})
    iniciar_sesion(pg); pg.wait_for_timeout(500)
    assert db(pg)["sessions"] == [] and "users/U1/sesiones/s2" not in cloud(pg)

@test
def sync_borrado_en_otro_dispositivo_se_aplica_aqui(pg):
    cl = {"users/U1": {"rutinas": [], "rutinasTs": 1}, "users/U1/sesiones/s": HISTORY and {k: v for k, v in HISTORY[0].items() if k != "id"}}
    seed(pg, sessions=SESIONES, fb={"logged": True, "cloud": cl}, meta={"syncedIds": {"sesiones": ["s", "s2"], "caminatas": []}}); pg.wait_for_timeout(900)
    assert [x["id"] for x in db(pg)["sessions"]] == ["s"], "s2 ya no está en la nube: se borró en otro dispositivo"

# ---------- Editar del historial ----------
def editar(pg, kind, id): tab(pg, "historial"); menu(pg, kind, id); pg.click(f'[data-edit-{kind}="{id}"]'); pg.wait_for_timeout(200)

@test
def historial_editar_entreno_kg_y_reps(pg):
    seed(pg, sessions=SESIONES); editar(pg, "session", "s2")
    assert pg.is_visible(".entry-editor") and pg.locator('.entry-editor input[data-f="kg"]').first.input_value() == "30"
    pg.locator('.entry-editor input[data-f="kg"]').first.fill("45"); pg.locator('.entry-editor input[data-f="reps"]').first.fill("12")
    pg.click("#entry-save")
    s2 = [x for x in db(pg)["sessions"] if x["id"] == "s2"][0]
    assert s2["sets"] == [{"exercise": "Remo", "reps": 12, "kg": 45, "w": False}], s2
    assert s2["upd"] > 0 and not pg.is_visible(".entry-editor")
    assert "540" in pg.inner_text("#history-list"), "el volumen debe recalcularse (45 x 12 = 540)"

@test
def historial_editar_cancelar_arriba_como_en_rutina(pg):
    seed(pg, sessions=SESIONES); editar(pg, "session", "s2")
    assert pg.evaluate("document.getElementById('entry-cancel').closest('.card-head, .entry-head') !== null"), "Cancelar va arriba"
    assert pg.locator(".eactions #entry-cancel").count() == 0, "ya no hay Cancelar abajo"
    assert pg.locator(".eactions #entry-save").count() == 1, "Guardar sigue abajo"

@test
def historial_cambiar_de_pestana_cancela_la_edicion(pg):
    seed(pg, sessions=SESIONES); editar(pg, "session", "s2")
    pg.locator('.entry-editor input[data-f="kg"]').first.fill("99")
    tab(pg, "rutinas"); pg.wait_for_timeout(300)
    tab(pg, "historial"); pg.wait_for_timeout(300)
    assert not pg.is_visible(".entry-editor"), "al cambiar de pestaña la edición se cancela"
    assert db(pg)["sessions"][1]["sets"][0]["kg"] == 30, "y no guarda los cambios"

@test
def historial_editar_cancelar_no_cambia_nada(pg):
    seed(pg, sessions=SESIONES); editar(pg, "session", "s2")
    pg.locator('.entry-editor input[data-f="kg"]').first.fill("99"); pg.click("#entry-cancel")
    assert db(pg)["sessions"][1]["sets"][0]["kg"] == 30 and not pg.is_visible(".entry-editor")

@test
def historial_editar_anadir_y_quitar_series_y_fecha(pg):
    seed(pg, sessions=SESIONES); editar(pg, "session", "s2")
    pg.click('.entry-editor [data-act="addset"]')
    assert pg.locator(".entry-editor .srow").count() == 2
    pg.locator('.entry-editor input[data-f="reps"]').nth(1).fill("8")
    pg.fill("#entry-date", "2026-10-20"); pg.click("#entry-save")
    s2 = [x for x in db(pg)["sessions"] if x["id"] == "s2"][0]
    assert s2["date"] == "2026-10-20" and len(s2["sets"]) == 2 and s2["sets"][1]["reps"] == 8, s2
    editar(pg, "session", "s2")
    pg.click('.entry-editor [data-act="delset"] >> nth=1'); pg.click("#entry-save")
    assert len([x for x in db(pg)["sessions"] if x["id"] == "s2"][0]["sets"]) == 1

@test
def historial_editar_sin_series_validas_no_guarda(pg):
    seed(pg, sessions=SESIONES); editar(pg, "session", "s2")
    pg.locator('.entry-editor input[data-f="reps"]').first.fill(""); pg.click("#entry-save")
    assert pg.is_visible(".entry-editor") and db(pg)["sessions"][1]["sets"][0]["reps"] == 10
    assert "serie" in pg.inner_text("#toast").lower()

@test
def historial_editar_caminata(pg):
    seed(pg, walks=CAMINATAS); editar(pg, "walk", "w1")
    assert pg.input_value("#entry-min") == "20" and pg.input_value("#entry-km") == "1.5"
    pg.fill("#entry-min", "30"); pg.fill("#entry-km", "2,5"); pg.click("#entry-save")
    w = db(pg)["walks"][0]
    assert w["seconds"] == 1800 and w["meters"] == 2500 and w["upd"] > 0, w

@test
def sync_editar_entreno_actualiza_la_nube(pg):
    seed(pg, sessions=SESIONES, fb={"logged": True}); pg.wait_for_timeout(900)
    editar(pg, "session", "s2")
    pg.locator('.entry-editor input[data-f="kg"]').first.fill("50"); pg.click("#entry-save"); pg.wait_for_timeout(900)
    assert cloud(pg)["users/U1/sesiones/s2"]["sets"][0]["kg"] == 50

@test
def sync_la_edicion_de_otro_dispositivo_se_aplica_aqui(pg):
    nube = {"date": "2026-11-03", "routine": "PULL", "sets": [{"exercise": "Remo", "reps": 10, "kg": 77, "w": False}], "upd": 9999999999999}
    cl = {"users/U1": {"rutinas": [], "rutinasTs": 1}, "users/U1/sesiones/s2": nube}
    seed(pg, sessions=SESIONES, fb={"logged": True, "cloud": cl}); pg.wait_for_timeout(900)
    assert [x for x in db(pg)["sessions"] if x["id"] == "s2"][0]["sets"][0]["kg"] == 77

@test
def historial_editar_abre_vista_propia_sin_el_resto(pg):
    seed(pg, sessions=SESIONES, walks=CAMINATAS); editar(pg, "session", "s2")
    assert pg.locator("#history-list .entry").count() == 1, "al editar solo debe verse la entrada que se edita"
    assert not pg.is_visible("#stats"), "las estadísticas se ocultan mientras se edita"
    assert pg.is_visible(".entry-editor")
    pg.click("#entry-cancel")
    assert pg.locator("#history-list .entry").count() == 3 and pg.is_visible("#stats")
    editar(pg, "walk", "w1")
    assert pg.locator("#history-list .entry").count() == 1 and not pg.is_visible("#stats")
    pg.click("#entry-save")
    assert pg.locator("#history-list .entry").count() == 3 and pg.is_visible("#stats")

@test
def la_app_se_llama_forjado(pg):
    seed(pg)
    assert pg.title() == "Forjado" and pg.inner_text("h1").strip() == "Forjado."
    assert len("Forjado") == 7, "el nombre tiene que tener 7 letras para encajar con la fecha"
    h1, ajustes = pg.locator("h1").bounding_box(), pg.locator("#settings-btn").bounding_box()
    assert h1["x"] + h1["width"] <= ajustes["x"] - 4, "el título no debe pisar el botón de ajustes"
    assert pg.get_attribute('meta[name="apple-mobile-web-app-title"]', "content") == "Forjado"
    m = json.loads(open(os.path.join(ROOT, "manifest.webmanifest")).read())
    assert m["name"] == "Forjado" and m["short_name"] == "Forjado"

@test
def icono_es_el_aro_grueso_crema_naranja(pg):
    from PIL import Image
    cerca = lambda a, b: all(abs(x - y) <= 14 for x, y in zip(a, b))
    CREMA, NARANJA, OSCURO, ARO = (243, 239, 230), (226, 90, 44), (23, 21, 15), (229, 223, 208)
    for nombre, tam, k in [("apple-touch-icon", 180, 1), ("icon-192", 192, 1), ("icon-512", 512, 1), ("icon-maskable-512", 512, .85)]:
        im = Image.open(os.path.join(ROOT, "icons", nombre + ".png")).convert("RGB")
        p = lambda x, y: im.getpixel((round(x / 140 * tam), round(y / 140 * tam)))
        c = lambda v: 70 + (v - 70) * k
        assert cerca(p(1, 1), CREMA), f"{nombre}: el fondo es crema a sangre: {p(1, 1)}"
        assert cerca(p(70, 70), OSCURO), f"{nombre}: punto oscuro en el centro: {p(70, 70)}"
        assert cerca(p(70, c(70 - 46)), NARANJA), f"{nombre}: el arco naranja empieza arriba: {p(70, c(24))}"
        assert cerca(p(c(70 - 46), 70), ARO), f"{nombre}: el tramo sin completar es beige: {p(c(24), 70)}"
    m = json.loads(open(os.path.join(ROOT, "manifest.webmanifest")).read())
    assert m["background_color"]

@test
def copia_restaurar_acepta_copias_antiguas_de_entreno(pg):
    seed(pg, routines=[], sessions=[])
    buena = {"id": "ok", "name": "VIEJA", "exercises": []}
    restaurar(pg, copia(routines=[buena], app="entreno"))
    assert [r["id"] for r in db(pg)["routines"]] == ["ok"]

# ---------- Calendario de días entrenados ----------
def ym(pg): return pg.evaluate("localDate().slice(0, 7)")
def sesion(fecha, id="c", rutina="PUSH"): return {"id": id, "date": fecha, "routine": rutina, "sets": [{"exercise": "Press", "reps": 5, "kg": 10, "w": False}]}

@test
def calendario_se_abre_al_tocar_la_semana_y_se_cierra(pg):
    seed(pg)
    assert not pg.is_visible("#cal-sheet")
    pg.click("#week"); pg.wait_for_timeout(500)
    assert pg.is_visible("#cal-sheet")
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    mes = int(ym(pg)[5:]) - 1
    assert meses[mes] in pg.inner_text("#cal-month").lower(), pg.inner_text("#cal-month")
    pg.click("#cal-close"); pg.wait_for_timeout(500)
    assert not pg.is_visible("#cal-sheet")
    pg.click("#week"); pg.wait_for_timeout(500); pg.click("#scrim", position={"x": 20, "y": 20}); pg.wait_for_timeout(500)
    assert not pg.is_visible("#cal-sheet")

@test
def calendario_marca_los_dias_entrenados(pg):
    pg.goto(URL); y = pg.evaluate("localDate().slice(0, 7)")
    prev = pg.evaluate("(() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return localDate(d).slice(0, 7); })()")
    seed(pg, sessions=[sesion(y + "-02", "a"), sesion(y + "-04", "b"), sesion(prev + "-10", "p")],
         walks=[{"id": "w", "date": y + "-04", "seconds": 1200, "meters": 1500}])
    pg.click("#week"); pg.wait_for_timeout(500)
    assert pg.locator("#cal-grid .cd.on").count() == 2, "dos días con actividad este mes (el 4 tiene entreno y caminata)"
    assert "2 días" in pg.inner_text("#cal-summary").lower() and "3 en total" in pg.inner_text("#cal-summary").lower(), pg.inner_text("#cal-summary")
    pg.click("#cal-prev"); pg.wait_for_timeout(200)
    assert pg.locator("#cal-grid .cd.on").count() == 1
    pg.click("#cal-next"); pg.wait_for_timeout(200)
    assert pg.locator("#cal-grid .cd.on").count() == 2

@test
def calendario_hoy_resaltado_y_no_pasa_del_mes_actual(pg):
    seed(pg); pg.click("#week"); pg.wait_for_timeout(500)
    assert pg.locator("#cal-grid .cd.today").count() == 1
    assert pg.is_disabled("#cal-next"), "no se puede avanzar más allá del mes actual"

@test
def calendario_tocar_un_dia_muestra_que_hiciste(pg):
    pg.goto(URL); y = pg.evaluate("localDate().slice(0, 7)")
    seed(pg, sessions=[sesion(y + "-04", "b", "PULL")], walks=[{"id": "w", "date": y + "-04", "seconds": 1200, "meters": 1500}])
    pg.click("#week"); pg.wait_for_timeout(500)
    pg.click(f'#cal-grid [data-date="{y}-04"]')
    t = pg.inner_text("#cal-day").lower()
    assert "pull" in t and "20 min" in t, t
    pg.click(f'#cal-grid [data-date="{y}-03"]')
    assert "nada" in pg.inner_text("#cal-day").lower()

# ---------- Calendario: fallos con ✕, descansos discontinuos y vista anual ----------
def dia(n):  # fecha local de hace n días
    return f"(() => {{ const d = new Date(); d.setDate(d.getDate() - {n}); return localDate(d); }})()"

def ir_al_dia(pg, n):
    fecha = pg.evaluate(dia(n))
    if pg.locator(f'#cal-grid [data-date="{fecha}"]').count() == 0:
        pg.click("#cal-prev"); pg.wait_for_timeout(150)
    return pg.locator(f'#cal-grid [data-date="{fecha}"]')

@test
def calendario_mes_pone_x_en_fallos_y_discontinuo_en_descansos(pg):
    pg.goto(URL)
    f = lambda n: pg.evaluate(dia(n))
    seed(pg, sessions=[sesion(f(1), "a"), sesion(f(3), "b"), sesion(f(4), "c"), sesion(f(6), "d")])
    pg.click("#week"); pg.wait_for_timeout(500)
    miss = ir_al_dia(pg, 5)
    assert "miss" in miss.get_attribute("class") and miss.inner_text().strip() == "✕", (miss.get_attribute("class"), miss.inner_text())
    pg.click("#cal-close"); pg.wait_for_timeout(400); pg.click("#week"); pg.wait_for_timeout(500)
    rest = ir_al_dia(pg, 2)
    assert "rest" in rest.get_attribute("class") and rest.inner_text().strip() == "–", (rest.get_attribute("class"), rest.inner_text())
    assert rest.evaluate("e => getComputedStyle(e).borderTopStyle") == "dashed"
    assert miss.evaluate("e => getComputedStyle(e).borderTopStyle") == "solid"

@test
def calendario_mes_no_marca_hoy_vacio_ni_dias_anteriores_al_primer_registro(pg):
    pg.goto(URL)
    seed(pg, sessions=[sesion(pg.evaluate(dia(3)), "a")])
    pg.click("#week"); pg.wait_for_timeout(500)
    hoy = pg.locator("#cal-grid .cd.today")
    assert "miss" not in hoy.get_attribute("class") and "✕" not in hoy.inner_text()
    antes = ir_al_dia(pg, 5)
    assert "miss" not in antes.get_attribute("class") and "✕" not in antes.inner_text(), "antes del primer registro no hay fallo"

@test
def calendario_vista_anual_pinta_los_dias_entrenados(pg):
    pg.goto(URL); y = pg.evaluate("new Date().getFullYear()")
    seed(pg, sessions=[sesion(f"{y}-01-05", "a"), sesion(f"{y}-01-06", "b"), sesion(f"{y}-01-20", "c")],
         walks=[{"id": "w", "date": f"{y}-01-20", "seconds": 600, "meters": 800}])
    pg.click("#week"); pg.wait_for_timeout(500)
    assert not pg.is_visible("#cal-year")
    pg.click('[data-calview="anio"]'); pg.wait_for_timeout(300)
    assert pg.is_visible("#cal-year") and not pg.is_visible("#cal-grid")
    assert str(y) in pg.inner_text("#cal-month")
    total = 366 if (y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)) else 365
    assert pg.locator("#cal-year .hm").count() == total, pg.locator("#cal-year .hm").count()
    assert pg.locator("#cal-year .hm.on").count() == 3
    assert pg.locator("#cal-year .hm-mes").count() == 12
    pg.click('[data-calview="mes"]'); pg.wait_for_timeout(300)
    assert pg.is_visible("#cal-grid") and not pg.is_visible("#cal-year")

@test
def calendario_vista_anual_cambia_de_ano_y_muestra_el_dia_tocado(pg):
    pg.goto(URL); y = pg.evaluate("new Date().getFullYear()")
    seed(pg, sessions=[sesion(f"{y - 1}-03-10", "a", "PULL"), sesion(f"{y}-02-02", "b")])
    pg.click("#week"); pg.wait_for_timeout(500); pg.click('[data-calview="anio"]'); pg.wait_for_timeout(300)
    assert pg.is_disabled("#cal-next")
    pg.click("#cal-prev"); pg.wait_for_timeout(200)
    assert str(y - 1) in pg.inner_text("#cal-month")
    assert pg.locator("#cal-year .hm.on").count() == 1
    pg.click(f'#cal-year [data-date="{y - 1}-03-10"]')
    assert "pull" in pg.inner_text("#cal-day").lower(), pg.inner_text("#cal-day")
    assert "sel" in pg.get_attribute(f'#cal-year [data-date="{y - 1}-03-10"]', "class")

@test
def calendario_vista_anual_cabe_en_la_hoja(pg):
    seed(pg); pg.click("#week"); pg.wait_for_timeout(500); pg.click('[data-calview="anio"]'); pg.wait_for_timeout(300)
    r = pg.evaluate("(() => { const s = document.querySelector('#cal-sheet').getBoundingClientRect(), g = document.querySelector('#cal-year').getBoundingClientRect(); return [s.left, s.right, g.left, g.right]; })()")
    assert r[2] >= r[0] and r[3] <= r[1] + 0.5, r

@test
def calendario_mes_el_dia_de_descanso_se_queda_en_su_casilla(pg):
    pg.goto(URL)
    f = lambda n: pg.evaluate(dia(n))
    seed(pg, sessions=[sesion(f(1), "a"), sesion(f(3), "b"), sesion(f(4), "c"), sesion(f(6), "d")])
    pg.click("#week"); pg.wait_for_timeout(500)
    c = ir_al_dia(pg, 2)
    assert c.evaluate("e => getComputedStyle(e).position") != "fixed", "choca con el panel de descanso del entreno"
    assert c.evaluate("e => getComputedStyle(e).borderTopStyle") == "dashed"
    b, g = c.bounding_box(), pg.locator("#cal-grid").bounding_box()
    assert b["width"] < 80 and g["x"] - 1 <= b["x"] and b["x"] + b["width"] <= g["x"] + g["width"] + 1 and g["y"] <= b["y"], (b, g)
    seg = pg.locator(".cal-views").bounding_box()
    assert b["y"] > seg["y"] + seg["height"], "no debe taparse con el selector MES/AÑO"

@test
def calendario_anual_los_meses_encajan_con_sus_columnas_en_varios_anos(pg):
    pg.goto(URL); y = pg.evaluate("new Date().getFullYear()")
    seed(pg, sessions=[sesion(f"{y - 2}-06-01", "a")])
    pg.click("#week"); pg.wait_for_timeout(500); pg.click('[data-calview="anio"]'); pg.wait_for_timeout(300)
    for _ in range(3):
        año = int(pg.inner_text("#cal-month"))
        r = pg.evaluate("""(y) => {
            const cells = [...document.querySelectorAll('#cal-year .hm')];
            const pitch = cells[7].getBoundingClientRect().left - cells[0].getBoundingClientRect().left;
            const labs = [...document.querySelectorAll('#cal-year .hm-mes')].map(l => l.getBoundingClientRect());
            const out = [];
            for (let m = 0; m < 12; m++) {
                const first = document.querySelector(`#cal-year [data-date="${y}-${String(m + 1).padStart(2, '0')}-01"]`).getBoundingClientRect();
                out.push({ dx: labs[m].left - first.left, pitch, w: labs[m].width, next: labs[m + 1] ? labs[m + 1].left - labs[m].left : 999 });
            }
            const gridL = Math.min(...cells.map(c => c.getBoundingClientRect().left)), gridR = Math.max(...cells.map(c => c.getBoundingClientRect().right));
            return { out, gridL, gridR, sheet: document.querySelector('#cal-sheet').getBoundingClientRect().right };
        }""", año)
        for m, o in enumerate(r["out"]):
            assert -1 <= o["dx"] <= o["pitch"] + 1, (año, m, o)      # a lo sumo una columna a la derecha del día 1
            assert o["w"] + 2 <= o["next"], (año, m, o, "etiquetas pisadas")
        assert r["gridR"] <= r["sheet"] + 0.5, (año, r)
        cols = pg.evaluate("""(y) => [...document.querySelectorAll('#cal-year .hm-mes')].map((l, m) => {
            const x = l.getBoundingClientRect().left, mm = String(m + 1).padStart(2, '0');
            return [...document.querySelectorAll('#cal-year .hm')].filter(c => Math.abs(c.getBoundingClientRect().left - x) < 2 && c.dataset.date.startsWith(y + '-' + mm)).length;
        })""", año)
        assert all(n >= 4 for n in cols[1:]), (año, cols, "la etiqueta debe ir sobre una columna que sea sobre todo de ese mes")
        pg.click("#cal-prev"); pg.wait_for_timeout(200)

@test
def entreno_empieza_con_kg_y_reps_vacios_y_lo_anterior_de_fondo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    vals = pg.eval_on_selector_all('#workout .wrow:not(.whead) input', "els => els.map(e => e.value)")
    assert all(v == "" for v in vals), vals
    ph = lambda ex, st, f: pg.get_attribute(f'#workout [data-ex="{ex}"][data-set="{st}"][data-f="{f}"]', "placeholder")
    assert (ph(0, 0, "kg"), ph(0, 0, "reps")) == ("39", "10"), "el fondo es lo de la vez anterior"
    assert (ph(0, 2, "kg"), ph(0, 2, "reps")) == ("41.3", "10"), "sin anterior, el fondo es lo de la rutina"
    # marcar sin escribir usa el fondo; escribir lo cambia
    pg.locator("#workout .wrow .chk").nth(2).click()
    assert pg.input_value('#workout [data-ex="0"][data-set="2"][data-f="kg"]') == "41.3"
    pg.fill('#workout [data-ex="0"][data-set="1"][data-f="kg"]', "45"); pg.locator("#workout .wrow .chk").nth(1).click()
    assert pg.input_value('#workout [data-ex="0"][data-set="1"][data-f="kg"]') == "45"
    assert pg.input_value('#workout [data-ex="0"][data-set="1"][data-f="reps"]') == "10"

@test
def entreno_serie_nueva_empieza_vacia_con_la_anterior_de_fondo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "b")
    pg.click('#workout [data-act="addset"]'); pg.wait_for_timeout(100)
    assert pg.input_value('#workout [data-ex="0"][data-set="1"][data-f="kg"]') == ""
    assert pg.get_attribute('#workout [data-ex="0"][data-set="1"][data-f="kg"]', "placeholder") == "30"

# ---------- Fondo: la raya diagonal ocupa toda la pantalla ----------
# ---------- La rutina desplegada no lleva gráfica de progreso ----------
# ---------- 1. La caminata sobrevive a recargar / cerrar la app ----------
def walk_saved(pg, ago_s, meters=0, goal=1200):
    pg.evaluate("([a, m, g]) => localStorage.setItem('entreno-walk', JSON.stringify({ start: Date.now() - a * 1000, goal: g, meters: m, done: false }))", [ago_s, meters, goal])

@test
def caminata_sobrevive_a_recargar(pg):
    seed(pg); pg.click("#walk-start"); pg.wait_for_timeout(1300)
    pg.reload(); pg.wait_for_timeout(700)
    assert pg.is_disabled("#walk-start") and not pg.is_disabled("#walk-finish"), "sigue en marcha"
    assert pg.inner_text("#walk-timer") != "00:00", pg.inner_text("#walk-timer")
    pg.click("#walk-finish"); pg.click("#walk-finish"); pg.wait_for_timeout(300)     # rendirse
    pg.reload(); pg.wait_for_timeout(500)
    assert not pg.is_disabled("#walk-start") and pg.evaluate("localStorage.getItem('entreno-walk')") in (None, ""), "rendirse la borra"

@test
def caminata_reanuda_con_el_tiempo_real_y_los_metros(pg):
    seed(pg); walk_saved(pg, 90, meters=500)
    pg.reload(); pg.wait_for_timeout(700)
    m, s = pg.inner_text("#walk-timer").split(":")
    assert 90 <= int(m) * 60 + int(s) <= 93, pg.inner_text("#walk-timer")
    assert pg.inner_text("#walk-dist") == "0.50"

@test
def caminata_vieja_de_mas_de_12h_se_descarta(pg):
    seed(pg); walk_saved(pg, 13 * 3600)
    pg.reload(); pg.wait_for_timeout(500)
    assert not pg.is_disabled("#walk-start") and pg.inner_text("#walk-timer") == "00:00"

@test
def caminata_terminada_tras_reanudar_se_guarda(pg):
    seed(pg); walk_saved(pg, 1300, goal=1200)
    pg.reload(); pg.wait_for_timeout(700)
    assert pg.inner_text("#walk-finish") == "Terminar"
    pg.click("#walk-finish"); pg.wait_for_timeout(300)
    assert len(db(pg)["walks"]) == 1 and pg.evaluate("localStorage.getItem('entreno-walk')") in (None, "")

# ---------- 2. Añadir / quitar ejercicios en el entreno y entreno libre ----------
@test
def entreno_anadir_ejercicio_abre_el_selector_no_un_campo_de_texto(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    assert pg.locator("#wk-new-ex").count() == 0, "ya no hay campo de texto libre"
    pg.click("#wk-add-ex"); pg.wait_for_selector("#picker-sheet.show")
    assert pg.is_visible("#picker-search"), "el buscador del selector se ve"
    assert pg.locator("#picker-list [data-name]").count() > 0, "el selector trae el catálogo"
    pg.click("#picker-close"); pg.wait_for_timeout(200)
    assert not pg.is_visible("#picker-sheet.show"), "se cierra con la X"

@test
def entreno_anadir_desde_el_selector_trae_foto_y_no_duplica(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    n = pg.locator("#wk-in .exblock").count()
    anadir_del_selector(pg, "Dominadas")
    assert pg.locator("#wk-in .exblock").count() == n + 1, "añade el ejercicio elegido"
    anadir_del_selector(pg, "Dominadas")
    assert pg.locator("#wk-in .exblock").count() == n + 1, "no lo añade dos veces"
    assert pg.locator("#wk-in .exblock").last.locator(".exn").inner_text().lower().startswith("dominadas"), "nombre en español"

@test
def entreno_se_puede_anadir_un_ejercicio(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    n = pg.locator("#wk-in .exblock").count()
    anadir_del_selector(pg, "Dominadas")
    assert pg.locator("#wk-in .exblock").count() == n + 1
    assert pg.locator("#wk-in .exblock").last.locator(".wrow:not(.whead)").count() == 3 and "dominadas" in pg.locator("#wk-in .exblock").last.inner_text().lower()
    pg.locator("#wk-in .exblock").last.locator('input[data-f="reps"]').first.fill("8")
    pg.locator("#wk-in .exblock").last.locator(".chk").first.click()
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(300)
    assert any(x["exercise"].lower().startswith("dominadas") for x in db(pg)["sessions"][-1]["sets"])

@test
def texto_no_se_selecciona_como_en_una_web_salvo_en_campos(pg):
    seed(pg); tab(pg, "rutinas")
    sel = lambda s: pg.evaluate("s => getComputedStyle(document.querySelector(s)).userSelect", s)
    assert sel("body") == "none", "el texto de la app no se puede seleccionar"
    assert sel("#routines-list") == "none", "tampoco en las listas"
    empezar(pg, "a")
    pg.locator("#wk-in .exblock").first.locator(".exn").wait_for()
    assert sel("#wk-in .exn") == "none", "los nombres del entreno no se seleccionan"

@test
def campos_de_texto_sí_se_pueden_editar_y_seleccionar(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    assert pg.evaluate("getComputedStyle(document.querySelector('#wk-in input[data-f=\"kg\"]')).userSelect") == "text", "los kilos se escriben y seleccionan"
    assert pg.evaluate("getComputedStyle(document.querySelector('#picker-search')).userSelect") == "text", "el buscador sí"

@test
def entreno_se_puede_quitar_un_ejercicio_con_doble_toque(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    n = pg.locator("#wk-in .exblock").count()
    pg.locator('#workout [data-act="delex"]').first.click()
    assert pg.locator("#wk-in .exblock").count() == n, "el primer toque solo arma"
    pg.locator('#workout [data-act="delex"]').first.click()
    assert pg.locator("#wk-in .exblock").count() == n - 1

def _filas(pg, ex=0): return pg.locator("#wk-in .exblock").nth(ex).locator(".wrow:not(.whead)").count()

def _arrastrar(pg, fila, dx, desde=None, pasos=8):
    r = fila.locator(".wprev").bounding_box()
    x0, y = (desde if desde is not None else r["x"] + r["width"] / 2), r["y"] + r["height"] / 2
    pg.mouse.move(x0, y); pg.mouse.down()
    for i in range(1, pasos + 1): pg.mouse.move(x0 + dx * i / pasos, y)
    pg.mouse.up(); pg.wait_for_timeout(450)

@test
def entreno_serie_se_elimina_arrastrandola_hacia_un_lado(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    assert pg.locator('#workout [data-act="delset"]').count() == 0, "no hay botón Quitar serie"
    n = _filas(pg); ex = pg.locator("#wk-in .exblock").first
    _arrastrar(pg, ex.locator(".wrow:not(.whead)").nth(2), 330)
    assert _filas(pg) == n - 1, "arrastrar a la derecha elimina la serie"
    _arrastrar(pg, ex.locator(".wrow:not(.whead)").nth(1), -330, desde=250)
    assert _filas(pg) == n - 2, "arrastrar a la izquierda también"

def _toque(pg, fila, dx, dy, pasos=10):
    """Arrastre con dedo real (eventos táctiles por CDP), para probar gestos en diagonal."""
    r = fila.locator(".wprev").bounding_box()
    x0, y0 = r["x"] + r["width"] / 2, r["y"] + r["height"] / 2
    cdp = pg.context.new_cdp_session(pg)
    cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x0, "y": y0}]})
    for i in range(1, pasos + 1):
        cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x0 + dx * i / pasos, "y": y0 + dy * i / pasos}]})
        pg.wait_for_timeout(16)
    cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    pg.wait_for_timeout(500)

@test
def entreno_arrastrar_serie_en_diagonal_tambien_la_elimina(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    ex = pg.locator("#wk-in .exblock").first; n = _filas(pg)
    _toque(pg, ex.locator(".wrow:not(.whead)").nth(2), 330, 300)      # ~42° de inclinación: antes hacía scroll
    assert _filas(pg) == n - 1, "un arrastre inclinado hacia un lado debe eliminar, no hacer scroll"
    _toque(pg, ex.locator(".wrow:not(.whead)").nth(1), -330, -240)
    assert _filas(pg) == n - 2, "también hacia la izquierda y arriba"

@test
def entreno_arrastre_vertical_sigue_haciendo_scroll_y_no_elimina(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    SC = "[...document.querySelectorAll('#workout, #wk-in, #wk-in *')].reduce((a, e) => a + e.scrollTop, 0) + scrollY"
    n = _filas(pg); y0 = pg.evaluate(SC)
    _toque(pg, pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1), 20, -260)
    assert _filas(pg) == n, "un gesto casi vertical no elimina"
    assert pg.evaluate(SC) > y0, f"un gesto vertical debe seguir haciendo scroll ({y0} -> {pg.evaluate(SC)})"

@test
def entreno_arrastre_lateral_inclinado_cancela_el_scroll_del_navegador(pg):
    """En iOS el gesto en diagonal empieza a hacer scroll y cancela el arrastre: hay que quitarle el gesto al navegador."""
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.evaluate("window.__tm = []; window.addEventListener('touchmove', e => window.__tm.push(e.defaultPrevented), {passive: true})")
    fila = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(2)
    _toque(pg, fila, 300, 150)                       # ~27°
    tm = pg.evaluate("window.__tm")
    assert tm and sum(tm) >= len(tm) - 2, f"los touchmove del arrastre lateral deben cancelarse: {tm}"
    pg.evaluate("window.__tm = []")
    _toque(pg, pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1), 10, -240)
    assert not any(pg.evaluate("window.__tm")), "un gesto vertical NO se cancela (sigue el scroll)"

@test
def entreno_arrastre_corto_no_elimina_y_vuelve(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    n = _filas(pg); fila = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1)
    _arrastrar(pg, fila, 70)
    assert _filas(pg) == n, "un arrastre corto no debe eliminar"
    tr = pg.evaluate("() => getComputedStyle(document.querySelectorAll('#wk-in .exblock')[0].querySelectorAll('.wrow:not(.whead)')[1]).transform")
    assert tr in ("none", "matrix(1, 0, 0, 1, 0, 0)"), f"la fila debe volver a su sitio: {tr}"

@test
def entreno_arrastre_se_ve_mientras_se_mueve(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    fila = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1)
    r = fila.locator(".wprev").bounding_box(); x0, y = r["x"] + r["width"] / 2, r["y"] + r["height"] / 2
    pg.mouse.move(x0, y); pg.mouse.down(); pg.mouse.move(x0 + 40, y); pg.mouse.move(x0 + 90, y)
    b0 = fila.bounding_box(); sw = pg.evaluate("document.querySelectorAll('#wk-in .wrow.swiping').length")
    pg.mouse.up(); pg.wait_for_timeout(400)
    assert sw == 1, "la fila arrastrada se marca para mostrar el aviso rojo"
    assert b0["x"] > 40, f"la fila sigue al dedo: {b0}"

@test
def entreno_arrastrar_serie_hecha_resta_volumen_y_no_toca_el_calentamiento(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    ex = pg.locator("#wk-in .exblock").first; fila = ex.locator(".wrow:not(.whead)").nth(1)
    fila.locator('input[data-f="kg"]').fill("100"); fila.locator('input[data-f="reps"]').fill("10"); fila.locator('[data-act="done"]').click(); pg.wait_for_timeout(200)
    vol = pg.inner_text("#wk-in .wk-head"); assert "1000" in vol.replace(".", "").replace(" ", ""), f"la serie hecha cuenta volumen: {vol!r}"; w = ex.locator(".wrow:not(.whead) .sn.w").count()
    n0 = _filas(pg); _arrastrar(pg, fila, 330)
    assert _filas(pg) == n0 - 1, f"la serie hecha debe eliminarse ({n0} -> {_filas(pg)})"
    assert pg.inner_text("#wk-in .wk-head") != vol, f"el volumen baja al eliminar la serie hecha: {vol!r} -> {pg.inner_text(chr(35)+'wk-in .wk-head')!r}"
    assert ex.locator(".wrow:not(.whead) .sn.w").count() == w, "arrastrar no debe alternar el calentamiento"

@test
def entreno_no_se_puede_arrastrar_la_ultima_serie(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    ex = pg.locator("#wk-in .exblock").first
    for _ in range(12):
        if _filas(pg) <= 1: break
        _arrastrar(pg, ex.locator(".wrow:not(.whead)").nth(0), 330)
    _arrastrar(pg, ex.locator(".wrow:not(.whead)").nth(0), 330)
    assert _filas(pg) == 1, "siempre queda al menos una serie"

@test
def entreno_libre_empieza_vacio_y_se_guarda(pg):
    seed(pg); tab(pg, "rutinas")
    pg.click("#free-workout"); assert pg.is_visible("#workout") and pg.locator("#wk-in .exblock").count() == 0
    anadir_del_selector(pg, "Dominadas")
    pg.locator('#workout input[data-f="reps"]').first.fill("6"); pg.locator("#workout .chk").first.click()
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(300)
    s = db(pg)["sessions"][-1]
    assert s["routine"] == "Entreno libre" and s["sets"][0]["exercise"].lower().startswith("dominadas")

# ---------- 3. Racha con días de descanso ----------
def off(pg, k): return pg.evaluate("k => { const d = new Date(); d.setDate(d.getDate() + k); return localDate(d); }", k)
def streak_info(pg, offsets, rest):
    return pg.evaluate("([o, r]) => { const days = new Set(o.map(k => { const d = new Date(); d.setDate(d.getDate() + k); return localDate(d); })); const i = streakInfo(days, r); return { n: i.n, rest: [...i.rest].length }; }", [offsets, rest])

@test
def racha_sin_descansos_se_rompe_con_un_hueco(pg):
    seed(pg)
    assert streak_info(pg, [-2, -1, 0], 0)["n"] == 3
    assert streak_info(pg, [-3, -2, 0], 0)["n"] == 1
    assert streak_info(pg, [-2, -1], 0)["n"] == 2, "hoy aún se puede salvar"

@test
def racha_con_un_descanso_perdona_un_dia_por_semana(pg):
    seed(pg)
    assert streak_info(pg, [-4, -3, -1, 0], 1) == {"n": 4, "rest": 1}, "el hueco del -2 se perdona"
    assert streak_info(pg, [-5, -4, 0], 1)["n"] == 1, "dos huecos seguidos rompen"
    assert streak_info(pg, [-9, -8, -7, -6, -5, -4, -3, -1, 0], 1) == {"n": 9, "rest": 1}
    assert streak_info(pg, [-3, -2, -1, 0, -12, -11, -10, -9, -8, -7, -6, -5], 1)["n"] == 12 - 0, "hueco en -4 perdonado"
    assert streak_info(pg, [-1, 0], 3)["n"] == 2 and streak_info(pg, [0], 2) == {"n": 1, "rest": 0}, "los descansos del final no cuentan"

@test
def racha_ajuste_de_descanso_en_ajustes_cambia_la_racha(pg):
    pg.goto(URL)
    seed(pg, sessions=[{"id": "x", "date": off_days(pg, -2), "routine": "PUSH", "sets": [{"exercise": "A", "reps": 5, "kg": 10, "w": False}]},
                       {"id": "y", "date": off_days(pg, 0), "routine": "PUSH", "sets": [{"exercise": "A", "reps": 5, "kg": 10, "w": False}]}])
    assert pg.inner_text("#streak-n") == "2", "por defecto se perdona un día de descanso"
    assert pg.locator(".day.restday").count() == 1
    abrir_ajustes(pg); pg.click('[data-descanso="0"]'); pg.wait_for_timeout(200)
    assert pg.inner_text("#streak-n") == "1" and pg.get_attribute('[data-descanso="0"]', "aria-pressed") == "true"
    assert pg.locator(".day.restday").count() == 0

def off_days(pg, k): return off(pg, k)

# ---------- 5. Récords (PR) ----------
def pset(ex, kg, reps, w=False): return {"exercise": ex, "reps": reps, "kg": kg, "w": w}
def psess(id, date, *sets): return {"id": id, "date": date, "routine": "PUSH", "sets": list(sets), "ts": 1}

@test
def records_se_calculan_contra_lo_anterior(pg):
    seed(pg, sessions=[psess("s1", "2026-10-01", pset("Press", 50, 10), pset("Press", 20, 12, True)),
                       psess("s2", "2026-10-08", pset("Press", 55, 8)),
                       psess("s3", "2026-10-15", pset("Press", 55, 8)),
                       psess("s4", "2026-10-22", pset("Press", 55, 10), pset("Press", 40, 20)),
                       psess("s5", "2026-10-29", pset("Remo", 30, 10))])
    prs = pg.evaluate("computePRs()")
    assert prs == {"s2": [0], "s4": [0]}, prs   # s1 y s5: primera vez (nada que batir); s3 iguala; s4: más reps con el mismo peso

@test
def records_se_marcan_en_el_historial(pg):
    seed(pg, sessions=[psess("s1", "2026-10-01", pset("Press", 50, 10)), psess("s2", "2026-10-08", pset("Press", 55, 8))])
    tab(pg, "historial")
    assert pg.locator(".hset .pr").count() == 1

@test
def records_avisan_en_el_entreno_en_vivo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")      # historial: Press de pecho 39 x 10
    pg.fill('#workout [data-ex="0"][data-set="1"][data-f="kg"]', "45"); pg.fill('#workout [data-ex="0"][data-set="1"][data-f="reps"]', "10")
    pg.locator(".wrow .chk").nth(1).click()
    assert pg.locator(".wrow .pr").count() == 1
    assert "récord" in pg.inner_text("#toast").lower(), pg.inner_text("#toast")
    pg.fill('#workout [data-ex="0"][data-set="2"][data-f="kg"]', "45"); pg.fill('#workout [data-ex="0"][data-set="2"][data-f="reps"]', "10")
    pg.locator(".wrow .chk").nth(2).click()
    assert pg.locator(".wrow .pr").count() == 1, "igualar el récord de este mismo entreno no es otro récord"
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_selector("#summary-sheet.show", timeout=5000)
    assert "1 récord" in pg.inner_text("#summary-sub").lower(), pg.inner_text("#summary-sub")

@test
def records_el_calentamiento_y_la_primera_vez_no_cuentan(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.fill('#workout [data-ex="0"][data-set="0"][data-f="kg"]', "99"); pg.locator(".wrow .chk").nth(0).click()
    assert pg.locator(".wrow .pr").count() == 0, "serie de calentamiento"
    pg.fill('#workout [data-ex="1"][data-set="0"][data-f="kg"]', "30"); pg.locator(".wrow .chk").nth(3).click()
    assert pg.locator(".wrow .pr").count() == 0, "Aperturas no tenía historial"

@test
def records_la_etiqueta_pr_no_descoloca_las_columnas(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.fill('#workout [data-ex="0"][data-set="1"][data-f="kg"]', "45"); pg.fill('#workout [data-ex="0"][data-set="1"][data-f="reps"]', "10")
    pg.locator(".wrow .chk").nth(1).click()
    assert pg.locator(".wrow .pr").count() == 1
    xs = [pg.locator(f'#workout [data-ex="0"][data-set="{i}"][data-f="kg"]').bounding_box()["x"] for i in (1, 2)]
    assert abs(xs[0] - xs[1]) < 1, xs

@test
def records_la_etiqueta_pr_va_en_el_numero_de_la_serie(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.fill('#workout [data-ex="0"][data-set="1"][data-f="kg"]', "45"); pg.fill('#workout [data-ex="0"][data-set="1"][data-f="reps"]', "10")
    pg.locator(".wrow .chk").nth(1).click()
    assert pg.locator("#workout .wrow .sn .pr").count() == 1
    assert pg.locator("#workout .wprev .pr").count() == 0
    sn = pg.locator("#workout .wrow .sn").nth(1); n = sn.bounding_box(); b = sn.locator(".pr").bounding_box()
    assert abs(b["x"] + b["width"] / 2 - (n["x"] + n["width"])) < 12 and b["y"] < n["y"] + n["height"] / 2, (n, b)
    assert sn.inner_text().replace("PR", "").strip() == "1", "el número de serie sigue visible"

@test
def semana_con_dia_de_descanso_no_rompe_la_maqueta(pg):
    pg.goto(URL)
    seed(pg, sessions=[{"id": "x", "date": off(pg, -2), "routine": "PUSH", "sets": [{"exercise": "A", "reps": 5, "kg": 10, "w": False}]},
                       {"id": "y", "date": off(pg, 0), "routine": "PUSH", "sets": [{"exercise": "A", "reps": 5, "kg": 10, "w": False}]}])
    r = pg.evaluate("[...document.querySelectorAll('#week .day')].map(d => { const b = d.getBoundingClientRect(); return [Math.round(b.width), getComputedStyle(d).position, getComputedStyle(d.querySelector('i')).position]; })")
    assert len(r) == 7 and len({w for w, _, _ in r}) == 1, r
    assert all(p == "static" and q == "static" for _, p, q in r), r

@test
def hoja_de_ajustes_no_se_sale_de_la_pantalla(pg):
    seed(pg); pg.set_viewport_size({"width": 390, "height": 480})
    abrir_ajustes(pg); pg.wait_for_timeout(500)
    b = pg.evaluate("(() => { const r = document.getElementById('settings-sheet').getBoundingClientRect(); return {top: r.top, bottom: r.bottom, h: innerHeight}; })()")
    assert b["top"] >= 0 and b["bottom"] <= b["h"] + 1, b
    assert pg.is_visible("#settings-close"), "el botón de cerrar se ve"
    assert pg.evaluate("(() => { const s = document.getElementById('settings-sheet'); return s.scrollHeight > s.clientHeight && getComputedStyle(s).overflowY !== 'visible'; })()"), "y se puede desplazar"

# ---------- Detalle de rutina: ejercicios, gráfica de progreso, solo EDITAR y COMENZAR ----------
PR_HIST = [psess("s1", "2026-10-01", pset("Press de pecho", 20, 10, True), pset("Press de pecho", 60, 5), pset("Press de pecho", 60, 5)),
           psess("s4", "2026-10-22", pset("Press de pecho", 70, 5), pset("Press de pecho", 50, 10), pset("Remo", 30, 10)),
           psess("s2", "2026-10-08", pset("Press de pecho", 65, 5)),
           psess("s3", "2026-10-15", pset("Press de pecho", 65, 5))]   # desordenadas a propósito

@test
def rutina_tocar_la_tarjeta_abre_el_detalle_con_ejercicios(pg):
    seed(pg); tab(pg, "rutinas")
    assert not pg.is_visible("#rscreen")
    abrir_rutina(pg, "a")
    assert pg.is_visible("#rscreen") and pg.inner_text("#rs-title").strip().upper() == "PUSH"
    assert pg.locator("#rscreen .rs-ex").count() == 2
    t = pg.inner_text("#rs-exercises").lower()
    assert "press de pecho" in t and "aperturas" in t and "41.3" in t, t
    pg.click("#rs-back"); assert not pg.is_visible("#rscreen") and pg.is_visible("#routines-list")
    abrir_rutina(pg, "a"); pg.keyboard.press("Escape"); pg.wait_for_timeout(100); assert not pg.is_visible("#rscreen")

@test
def rutina_botones_en_la_tarjeta_comenzar_primero_y_a_la_izquierda(pg):
    seed(pg); tab(pg, "rutinas")
    pg.wait_for_timeout(450)   # la lista entra con una animación corta
    c, e = pg.locator('[data-start-routine="a"]').bounding_box(), pg.locator('[data-edit-routine="a"]').bounding_box()
    assert c["x"] < e["x"] and abs(c["y"] - e["y"]) < 2, (c, e)
    assert c["width"] > e["width"], "COMENZAR es el principal"
    empezar(pg, "a"); assert pg.is_visible("#workout") and "PUSH" in pg.inner_text("#wk-in .wk-title").upper()

@test
def rutina_boton_editar_de_la_tarjeta_abre_el_editor_con_la_rutina(pg):
    seed(pg); tab(pg, "rutinas"); editar_rutina(pg, "a")
    assert pg.is_visible("#editor-card") and pg.input_value("#routine-name") == "PUSH" and pg.is_visible("#routine-delete")
    pg.click("#editor-cancel"); pg.click("#new-routine")
    assert not pg.is_visible("#routine-delete"), "una rutina nueva no se puede borrar"

@test
def rutina_tocar_los_botones_no_abre_el_detalle_y_el_detalle_no_tiene_acciones(pg):
    seed(pg); tab(pg, "rutinas"); abrir_rutina(pg, "a")
    assert pg.locator("#rscreen .btn, #rscreen [data-start-routine], #rscreen [data-edit-routine]").count() == 0
    pg.click("#rs-back"); empezar(pg, "a")
    assert not pg.is_visible("#rscreen")

@test
def progreso_series_por_ejercicio_ordenadas_sin_calentamiento(pg):
    seed(pg, sessions=PR_HIST)
    r = lambda m: [round(p["v"], 2) for p in pg.evaluate(f"exerciseSeries('Press de pecho', '{m}')")]
    assert r("rm") == [70.0, 75.83, 75.83, 81.67], r("rm")     # mejor 1RM estimado de cada entreno (kg × (1 + reps/30))
    assert r("kg") == [60, 65, 65, 70], r("kg")
    assert r("vol") == [600, 325, 325, 850], r("vol")          # sin contar el calentamiento
    assert [p["date"] for p in pg.evaluate("exerciseSeries('Press de pecho', 'rm')")] == ["2026-10-01", "2026-10-08", "2026-10-15", "2026-10-22"]
    assert len(pg.evaluate("exerciseSeries('Remo', 'rm')")) == 1 and pg.evaluate("exerciseSeries('Dominadas', 'rm')") == []

@test
def progreso_grafica_dibuja_linea_y_puntos_con_records(pg):
    seed(pg, sessions=PR_HIST); tab(pg, "rutinas"); abrir_rutina(pg, "a")
    assert "press de pecho" in pg.inner_text("#rs-chart-title").lower()
    assert pg.locator("#rs-chart svg .pt").count() == 4 and pg.locator("#rs-chart svg .rs-line").count() == 1
    assert pg.locator("#rs-chart svg .pt.pr").count() == 2, "récords: 2.º y 4.º entreno (el 3.º solo iguala)"
    ys = pg.eval_on_selector_all("#rs-chart svg .pt circle:not(.hit)", "els => els.map(e => +e.getAttribute('cy'))")
    xs = pg.eval_on_selector_all("#rs-chart svg .pt circle:not(.hit)", "els => els.map(e => +e.getAttribute('cx'))")
    assert xs == sorted(xs) and len(set(xs)) == 4, xs
    assert ys[3] == min(ys) and ys[0] == max(ys), ys          # el mejor, arriba; el peor, abajo
    assert pg.locator("#rs-chart .rs-y").count() >= 3 and pg.locator("#rs-chart .rs-x").count() >= 2, "ejes con etiquetas"
    sv, vw = pg.locator("#rs-chart svg").bounding_box(), pg.evaluate("innerWidth")
    assert sv["x"] >= 0 and sv["x"] + sv["width"] <= vw + 0.5, sv

@test
def progreso_tocar_un_punto_muestra_fecha_y_valor(pg):
    seed(pg, sessions=PR_HIST); tab(pg, "rutinas"); abrir_rutina(pg, "a")
    t = pg.inner_text("#rs-read").lower()
    assert "22 oct" in t and "81.7" in t and "70 kg × 5" in t, t          # por defecto, el último entreno
    pg.click('#rs-chart .pt[data-i="1"]')
    t = pg.inner_text("#rs-read").lower()
    assert "8 oct" in t and "75.8" in t, t
    assert "sel" in pg.get_attribute('#rs-chart .pt[data-i="1"]', "class")

@test
def progreso_cambia_de_metrica_y_de_ejercicio(pg):
    seed(pg, sessions=PR_HIST); tab(pg, "rutinas"); abrir_rutina(pg, "a")
    assert pg.get_attribute('[data-rs-metric="rm"]', "aria-pressed") == "true"
    pg.click('[data-rs-metric="vol"]'); assert "850" in pg.inner_text("#rs-read")
    assert pg.get_attribute('[data-rs-metric="vol"]', "aria-pressed") == "true" and pg.get_attribute('[data-rs-metric="rm"]', "aria-pressed") == "false"
    pg.click('[data-rs-metric="kg"]'); assert "70" in pg.inner_text("#rs-read") and "850" not in pg.inner_text("#rs-read")
    pg.click('[data-rs-ex="1"]')       # Aperturas: sin historial
    assert "aperturas" in pg.inner_text("#rs-chart-title").lower()
    assert pg.locator("#rs-chart svg .pt").count() == 0 and pg.is_visible("#rs-chart .rs-empty")
    assert pg.get_attribute('[data-rs-ex="1"]', "aria-pressed") == "true" and pg.get_attribute('[data-rs-ex="0"]', "aria-pressed") == "false"

@test
def progreso_con_un_solo_entreno_dibuja_el_punto_sin_linea(pg):
    seed(pg, sessions=[psess("s1", "2026-10-01", pset("Press de pecho", 60, 5))]); tab(pg, "rutinas"); abrir_rutina(pg, "a")
    assert pg.locator("#rs-chart svg .pt").count() == 1 and pg.locator("#rs-chart svg .rs-line").count() == 0
    assert pg.locator("#rs-chart svg .pt.pr").count() == 0, "el primero no es récord: no hay nada que batir"

@test
def rutina_la_lista_no_lleva_grafica(pg):
    seed(pg, sessions=PR_HIST); tab(pg, "rutinas")
    assert pg.locator("#routines-list svg").count() == 0 or pg.locator("#routines-list svg:not(.ico)").count() == 0

# ---------- Historial compacto (resumen + detalle plegable) y botón de borrar separado ----------
GRANDE = [{"id": "g1", "date": "2026-11-01", "routine": "PULL", "seconds": 3720, "ts": 1, "sets": [
    {"exercise": "Jalón", "reps": 10, "kg": 47.3, "w": False}, {"exercise": "Jalón", "reps": 10, "kg": 52, "w": False},
    {"exercise": "Remo", "reps": 10, "kg": 40, "w": True}, {"exercise": "Remo", "reps": 8, "kg": 60, "w": False},
    {"exercise": "Curl", "reps": 12, "kg": 15, "w": False}, {"exercise": "Face pull", "reps": 15, "kg": 20, "w": False}]}]

@test
def historial_entreno_se_ve_compacto_con_resumen(pg):
    seed(pg, sessions=GRANDE); tab(pg, "historial")
    card = pg.locator("#history-list .entry").first
    t = card.inner_text().lower()
    assert "1h 2min" in t, t                       # tiempo
    hs = card.locator(".hstats").inner_text().replace("\n", " ")
    assert "Series 6" in hs and "Volumen 2353 kg" in hs.replace(".", ""), hs   # 473+520+400(W)+480+180+300: el calentamiento suma
    lines = card.locator(".hsum").all_inner_texts()
    assert len(lines) == 3 and "jalón" in lines[0].lower() and "2 series" in lines[0].lower(), lines
    assert "remo" in lines[1].lower() and "2 series" in lines[1].lower(), "el calentamiento cuenta como serie"
    assert not pg.locator(".hset").first.is_visible(), "las series sueltas van plegadas"
    assert "ver 1 ejercicio más" in card.locator(".hmore").inner_text().lower(), card.locator(".hmore").inner_text()
    assert card.bounding_box()["height"] <= 330, card.bounding_box()["height"]

@test
def historial_ver_detalle_despliega_y_pliega(pg):
    seed(pg, sessions=GRANDE); tab(pg, "historial")
    card = pg.locator("#history-list .entry").first; h0 = card.bounding_box()["height"]
    pg.click('[data-toggle-entry="g1"]')
    assert pg.locator(".hset").first.is_visible() and pg.locator(".hset").count() == 6
    assert "face pull" in card.inner_text().lower() and card.bounding_box()["height"] > h0
    assert pg.get_attribute('[data-toggle-entry="g1"]', "aria-expanded") == "true"
    pg.evaluate("persist()")                       # un re-render no debe plegarlo
    assert pg.locator(".hset").first.is_visible()
    pg.click('[data-toggle-entry="g1"]')
    assert not pg.locator(".hset").first.is_visible() and pg.locator(".hsum").count() == 3

@test
def historial_con_tres_ejercicios_o_menos_no_dice_mas_ejercicios(pg):
    seed(pg, sessions=[{"id": "t", "date": "2026-11-01", "routine": "X", "ts": 1, "sets": [{"exercise": "A", "reps": 5, "kg": 10, "w": False}]}]); tab(pg, "historial")
    t = pg.inner_text(".hmore").lower()
    assert "más" not in t and "detalle" in t, t

@test
def rutina_borrar_no_se_pega_a_guardar(pg):
    seed(pg); tab(pg, "rutinas"); editar_rutina(pg, "a"); pg.wait_for_timeout(450)  # fin de la animación de entrada
    g, d = pg.locator("#routine-save").bounding_box(), pg.locator("#routine-delete").bounding_box()
    assert d["y"] - (g["y"] + g["height"]) >= 8, (g, d)

@test
def ejercicios_todos_los_pasos_en_espanol(pg):
    import re as _re
    en = {"the", "and", "your", "with", "of", "to", "in", "on", "for", "keep", "hold", "pull", "back", "starting", "position",
          "slowly", "while", "from", "toward", "towards", "feet", "hands", "arms", "legs", "knees", "body", "core", "tension",
          "repeat", "return", "lower", "raise", "squeeze", "stand", "start", "bend", "extend", "each", "side", "floor", "use", "a", "one"}
    es = {"el", "la", "los", "las", "y", "con", "de", "en", "para", "que", "del", "al", "un", "una", "manteniendo", "baja", "sube",
          "repite", "posición", "inicial", "brazos", "piernas", "pies", "manos", "cuerpo", "tronco", "espalda", "lentamente", "mientras",
          "desde", "hacia", "hasta", "por", "se", "su", "sus", "es", "sin", "o", "al"}
    data = json.loads(open(os.path.join(ROOT, "ejercicios_local.json"), encoding="utf-8").read())
    malos = []
    for e in data:
        for paso in e.get("instructions", []):
            w = _re.findall(r"[a-záéíóúñü]+", paso.lower())
            if sum(x in en for x in w) > sum(x in es for x in w) and sum(x in en for x in w) >= 2:
                malos.append((e["name"], paso[:60]))
    assert not malos, f"{len(malos)} pasos en inglés, p. ej.: {malos[:3]}"

@test
def ejercicios_nombres_en_espanol_de_gimnasio(pg):
    cat = json.loads(open(os.path.join(ROOT, "ejercicios_local.json"), encoding="utf-8").read())
    tr = json.loads(open(os.path.join(ROOT, "traducciones.json"), encoding="utf-8").read())
    faltan = [e["name"] for e in cat if e["name"] not in tr]
    assert not faltan, f"sin traducción: {faltan[:5]}"
    esperado = {
        "Pull Up": "Dominadas", "Chin Up": "Dominadas supinas", "Push Up": "Flexiones", "Sit Up": "Abdominales",
        "Chest Fly (Machine)": "Aperturas de pecho (máquina)", "Chest Fly (Dumbbell)": "Aperturas de pecho (con mancuernas)",
        "Incline Chest Fly (Dumbbell)": "Aperturas inclinadas (con mancuernas)", "Clean": "Cargada", "Snatch": "Arrancada",
        "Lat Pulldown (Machine)": "Jalón dorsal (máquina)", "Deadlift (Barbell)": "Peso muerto (con barra)",
        "Squat (Barbell)": "Sentadilla (con barra)", "Lunge": "Zancada", "Plank": "Plancha", "Dead Bug": "Dead bug",
        "Jumping Jack": "Jumping jack", "Dragon Flag": "Bandera del dragón", "Dead Hang": "Colgado en barra (dead hang)",
        "Ab Wheel": "Rueda abdominal", "Clamshell": "Clamshell (apertura de concha)",
    }
    mal = {k: tr[k] for k, v in esperado.items() if tr.get(k) != v}
    assert not mal, f"términos mal traducidos: {mal}"
    feos = [(k, v) for k, v in tr.items() if k in {e["name"] for e in cat} and (v.endswith(".") or not v[:1].isupper() and not v[:1].isdigit() or "Mosca" in v or "molusco" in v or "Limpio" == v)]
    assert not feos, f"nombres con mayúscula o punto raros: {feos[:5]}"

@test
def ejercicios_catalogo_viejo_en_el_movil_se_actualiza(pg):
    seed(pg)
    # simula un móvil que guardó el catálogo antiguo: un ejercicio en inglés y otro sin pasos
    pg.evaluate("""async () => {
        const data = await (await fetch('ejercicios_local.json')).json();
        const viejo = data.map(e => ({...e}));
        viejo.find(e => e.id === 'battle-ropes').instructions = ['Hold the ends of the rope at arm length.'];
        viejo.find(e => e.id === 'clamshell').instructions = [];
        const db = await ejOpenIDB();
        await new Promise((res, rej) => { const tx = db.transaction(EJ_STORE, 'readwrite');
            const st = tx.objectStore(EJ_STORE); st.clear(); viejo.forEach(e => st.put(e));
            tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
        db.close();
    }""")
    pg.reload(); pg.wait_for_timeout(500)
    pasos = pg.evaluate("""async () => { ejCache = null; await loadEjercicios();
        return { br: ejCache.find(e => e.id === 'battle-ropes').instructions[0],
                 vacios: ejCache.filter(e => !e.instructions.length).length }; }""")
    assert pasos["br"].startswith("Sujeta"), f"el móvil debe recibir los pasos nuevos, no los viejos: {pasos['br']!r}"
    assert pasos["vacios"] == 0, f"ningún ejercicio sin pasos: {pasos['vacios']}"

@test
def rutinas_muestran_los_grupos_musculares_de_cada_rutina(pg):
    seed(pg)
    pg.evaluate("""() => { const s = () => [{w: false, kg: '', reps: ''}];
        db.routines = [{id: 'rp', name: 'Empuje', exercises: [
            {name: 'Aperturas', ejId: 'chest-fly-machine', image: '', sets: s()},
            {name: 'Press militar', ejId: 'shoulder-press-dumbbell', image: '', sets: s()},
            {name: 'Fondos', ejId: 'seated-triceps-press', image: '', sets: s()},
            {name: 'Aperturas 2', ejId: 'chest-fly-machine', image: '', sets: s()}]}];
        render(); }""")
    tab(pg, "rutinas"); pg.wait_for_selector("#routines-list .routine .rtags span", timeout=3000)
    grupos = pg.locator("#routines-list .routine .rtags span").all_inner_texts()
    assert grupos == ["Pecho", "Hombro", "Tríceps"], f"sin repetir y en orden de aparición: {grupos}"

def _rutina_abc(pg):
    s = lambda: [{"w": False, "kg": "", "reps": ""}]
    seed(pg, routines=[{"id": "r1", "name": "Rutina", "exercises": [
        {"name": "A", "ejId": "", "image": "", "sets": s()},
        {"name": "B", "ejId": "", "image": "", "sets": s()},
        {"name": "C", "ejId": "", "image": "", "sets": s()}]}])

def _nombres_editor(pg):
    return pg.locator("#routine-exercises .exname").evaluate_all("els => els.map(e => e.value)")

@test
def rutina_editor_sin_indicador_de_arrastre(pg):
    _rutina_abc(pg); tab(pg, "rutinas"); editar_rutina(pg, "r1")
    n = pg.locator("#routine-exercises .exhandle, #routine-exercises .chevbtn, #routine-exercises [data-act='togglecol']").count()
    assert n == 0, "sin asa ni flecha: nada indica que el ejercicio se puede mover"

@test
def rutina_editor_mantener_cierra_series_y_permite_mover(pg):
    _rutina_abc(pg); tab(pg, "rutinas"); editar_rutina(pg, "r1")
    bloques = pg.locator("#routine-exercises .exblock")
    r = bloques.nth(0).locator(".exhead").bounding_box(); x, y = r["x"] + 8, r["y"] + r["height"] / 2
    pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(120); pg.mouse.up(); pg.wait_for_timeout(150)
    assert bloques.nth(0).locator(".srow").count() >= 1, "una pulsación corta no cierra las series"
    pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(700)
    assert "is-collapsed" in bloques.nth(0).get_attribute("class"), "al mantener, las series se cierran"
    assert "is-collapsed" in bloques.nth(1).get_attribute("class"), "al mantener, se compactan todos los ejercicios"
    assert bloques.nth(0).evaluate("el => getComputedStyle(el).boxShadow") == "none", "sin borde azul al mover"
    assert pg.locator("#routine-exercises .excol-n").count() == 0, "sin texto de series al compactar"
    b0 = bloques.nth(0).bounding_box(); b1 = bloques.nth(1).bounding_box()
    dy = (b1["y"] + b1["height"] / 2) - (b0["y"] + b0["height"] / 2) + 12
    for i in range(1, 13): pg.mouse.move(x, y + dy * i / 12)
    assert "translateY(-" in bloques.nth(1).evaluate("el => el.style.transform"), "mientras se arrastra, el ejercicio de debajo se desplaza para dejar hueco"
    pg.mouse.up(); pg.wait_for_timeout(300)
    assert _nombres_editor(pg) == ["B", "A", "C"], f"al soltar, el ejercicio cambia de sitio: {_nombres_editor(pg)}"
    assert pg.locator("#routine-exercises .exblock").nth(1).locator(".srow").count() >= 1, "al soltar, las series vuelven a verse"
    pg.click("#routine-save"); pg.wait_for_timeout(300)
    orden = pg.evaluate("db.routines.find(r => r.id === 'r1').exercises.map(e => e.name)")
    assert orden == ["B", "A", "C"], f"el orden se guarda: {orden}"

@test
def picker_ejercicios_es_pagina_entera_y_el_buscador_no_se_tapa(pg):
    seed(pg)
    tab(pg, "rutinas"); pg.click("#new-routine"); pg.wait_for_timeout(200)
    pg.click("#add-exercise"); pg.wait_for_selector("#picker-sheet.show", timeout=2000); pg.wait_for_timeout(450)
    vh = pg.evaluate("innerHeight")
    caja = pg.locator("#picker-sheet").bounding_box()
    assert caja["y"] <= 1 and abs(caja["y"] + caja["height"] - vh) <= 2, f"el buscador ocupa toda la pantalla: {caja} vh={vh}"
    # con el teclado abierto la pantalla se encoge: el buscador debe seguir visible arriba
    pg.set_viewport_size({"width": 390, "height": 420}); pg.wait_for_timeout(300)
    b = pg.locator("#picker-search").bounding_box()
    assert b["y"] >= 0 and b["y"] + b["height"] <= 420, f"el buscador queda tapado por el teclado: {b}"
    pg.set_viewport_size({"width": 390, "height": 844})

@test
def rutina_editor_colapso_se_anima_con_el_contenido(pg):
    _rutina_abc(pg); tab(pg, "rutinas"); editar_rutina(pg, "r1")
    bloque = pg.locator("#routine-exercises .exblock").nth(0)
    r = bloque.locator(".exhead").bounding_box(); x, y = r["x"] + 8, r["y"] + r["height"] / 2
    pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(700)
    assert bloque.locator(".exbody").evaluate("el => getComputedStyle(el).transitionProperty").find("grid-template-rows") >= 0, "el colapso tiene transición de altura"
    assert bloque.locator(".exbody").evaluate("el => getComputedStyle(el).gridTemplateRows") == "0px", "el cuerpo se cierra hasta 0"
    assert bloque.locator(".exbody-in").evaluate("el => getComputedStyle(el).opacity") == "0", "las series se desvanecen"
    assert bloque.locator(".srow").count() >= 1, "las series siguen en el DOM, solo se cierran"
    pg.mouse.up(); pg.wait_for_timeout(200)

@test
def rutina_editor_al_soltar_las_series_se_despliegan_animadas(pg):
    _rutina_abc(pg); tab(pg, "rutinas"); editar_rutina(pg, "r1")
    bloque = pg.locator("#routine-exercises .exblock").nth(0)
    r = bloque.locator(".exhead").bounding_box(); x, y = r["x"] + 8, r["y"] + r["height"] / 2
    pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(700); pg.mouse.up()
    # justo al soltar, el cuerpo arranca cerrado y va creciendo (no aparece de golpe)
    mid = pg.evaluate("""() => new Promise(res => setTimeout(() => {
        const el = document.querySelector('#routine-exercises .exblock .exbody');
        res(el.getBoundingClientRect().height);
    }, 60))""")
    pg.wait_for_timeout(500)
    full = pg.locator("#routine-exercises .exblock").nth(0).locator(".exbody").evaluate("el => el.getBoundingClientRect().height")
    assert full > 20, f"las series vuelven a verse: {full}"
    assert 2 < mid < full - 2, f"al volver a desplegar hay animación: a 60 ms mide {mid} de {full}"
    assert pg.locator("#routine-exercises .exblock.is-collapsed").count() == 0, "todas abiertas al final"

@test
def entreno_descanso_sigue_abajo_al_bajar(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    for q in EXTRAS:
        anadir_del_selector(pg, q)
    row = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1)  # la 1, no el calentamiento W
    row.locator('input[data-f="kg"]').fill("60"); row.locator('input[data-f="reps"]').fill("10")
    row.locator('[data-act="done"]').click(); pg.wait_for_timeout(500)
    assert pg.is_visible("#rest"), "al completar una serie arranca el descanso"
    pg.evaluate("document.getElementById('workout').scrollTop = 600"); pg.wait_for_timeout(400)
    assert pg.evaluate("document.getElementById('workout').scrollTop") > 300, "debe poder bajar"
    b = pg.locator("#rest").bounding_box(); vh = pg.evaluate("innerHeight")
    assert abs((b["y"] + b["height"]) - vh) <= 2, f"el descanso sigue pegado abajo al bajar: bottom={b['y'] + b['height']} vh={vh}"

@test
def entreno_al_bajar_siguen_a_la_vista_el_nombre_el_tiempo_y_el_volumen(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    for q in EXTRAS:
        anadir_del_selector(pg, q)
    pg.evaluate("document.getElementById('workout').scrollTop = 99999"); pg.wait_for_timeout(200)
    assert pg.evaluate("document.getElementById('workout').scrollTop") > 600, "debe haber bastante contenido para bajar"
    vh = pg.evaluate("innerHeight")
    for sel in ["#wk-in .wk-title", "#wk-time", "#wk-vol", "#wk-sets", "#wk-finish"]:
        b = pg.locator(sel).bounding_box()
        assert b and b["y"] >= 0 and b["y"] + b["height"] <= 200, (sel, b)
    head = pg.locator(".wk-head").bounding_box()
    assert head["height"] <= 150, head

@test
def entreno_el_calentamiento_si_cuenta_en_volumen_y_series(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    chk = pg.locator("#workout .wrow:not(.whead) .chk")
    pg.fill('#workout [data-ex="0"][data-set="0"][data-f="kg"]', "20"); pg.fill('#workout [data-ex="0"][data-set="0"][data-f="reps"]', "10")
    chk.nth(0).click()                                  # W: 20 kg x 10 = 200
    assert pg.inner_text("#wk-sets") == "1" and pg.inner_text("#wk-vol").replace(".", "") == "200", (pg.inner_text("#wk-sets"), pg.inner_text("#wk-vol"))
    pg.fill('#workout [data-ex="0"][data-set="1"][data-f="kg"]', "39"); pg.fill('#workout [data-ex="0"][data-set="1"][data-f="reps"]', "10")
    chk.nth(1).click()                                  # serie 1: 39 x 10 = 390
    assert pg.inner_text("#wk-sets") == "2" and pg.inner_text("#wk-vol").replace(".", "") == "590"
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(300)
    assert len(db(pg)["sessions"][-1]["sets"]) == 2
    pg.click("#summary-done"); pg.wait_for_timeout(500)
    tab(pg, "historial")
    assert "590" in pg.locator("#history-list .hstats").first.inner_text(), "el historial suma también el calentamiento"

@test
def entreno_solo_con_calentamiento_se_puede_terminar_sin_perderlo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator("#workout .wrow:not(.whead) .chk").nth(0).click()
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(300)
    assert not pg.is_visible("#workout")

# ---------- Estilo PAPEL CLARO ----------
def _rgb(pg, sel, prop):
    return pg.evaluate("([s,p]) => getComputedStyle(document.querySelector(s))[p]", [sel, prop])

def _lum(c):
    c = c.strip()
    if c.startswith("#"): r, g, b = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    else: r, g, b = [float(x) / 255 for x in c[c.index("(") + 1:c.index(")")].replace(",", " ").split()[:3]]
    f = lambda v: v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)
def _contraste(a, b):
    x, y = sorted([_lum(a), _lum(b)]); return (y + .05) / (x + .05)
def _tema(pg, t):
    pg.evaluate("t => localStorage.setItem('entreno-tema', t)", t); pg.reload(); pg.wait_for_timeout(300)
def _var(pg, n): return pg.evaluate("n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()", n)

@test
def tema_oscuro_por_defecto(pg):
    seed(pg)
    pg.evaluate("localStorage.removeItem('entreno-tema')"); pg.reload(); pg.wait_for_timeout(300)
    assert pg.evaluate("document.documentElement.dataset.theme") == "dark", "sin tema guardado, arranca en oscuro"
    bg = _rgb(pg, "body", "backgroundColor")
    assert _lum(bg) < .03, f"fondo oscuro: {bg}"
    assert bg != "rgb(0, 0, 0)" and _rgb(pg, "body", "color") != "rgb(255, 255, 255)", "ni negro ni blanco puros"
    meta = pg.get_attribute('meta[name="theme-color"]', "content")
    assert _contraste(meta, bg) < 1.02, f"la barra de estado tiene el color del fondo: {meta} / {bg}"
    pg.click("#settings-btn"); pg.wait_for_timeout(300)
    assert pg.get_attribute('[data-tema="dark"]', "aria-pressed") == "true"
    m = json.loads(open(os.path.join(ROOT, "manifest.webmanifest")).read())
    assert _lum(m["background_color"]) < .03, "la pantalla de arranque también es oscura"

@test
def tema_claro_colores_papel(pg):
    seed(pg); _tema(pg, "light")
    assert pg.evaluate("document.documentElement.dataset.theme") == "light"
    assert _rgb(pg, "body", "backgroundColor") == "rgb(238, 242, 249)", _rgb(pg, "body", "backgroundColor")
    assert _rgb(pg, ".card", "backgroundColor") == "rgb(255, 255, 255)", _rgb(pg, ".card", "backgroundColor")

def _hue(c):
    import colorsys
    r, g, b = [x / 255 for x in _rgb_t(c)]
    return colorsys.rgb_to_hsv(r, g, b)[0] * 360

def _rgb_t(c):
    import re
    return tuple(int(x) for x in re.findall(r"\d+", c)[:3])

@test
def azul_oscuro_fondo_azul_noche_y_acento_azul(pg):
    seed(pg)
    assert _var(pg, "--bg").lower() == "#0a1220", _var(pg, "--bg")
    for n in ["--bg", "--surface", "--surface-2", "--surface-3"]:
        h = _hue("rgb(%d,%d,%d)" % tuple(int(_var(pg, n).lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)))
        assert 205 <= h <= 235, f"{n} es azul, no marrón: tono {h:.0f}"
    assert _var(pg, "--fire").lower() == "#3169e6", _var(pg, "--fire")
    assert _var(pg, "--on-fire").lower() == "#ffffff"
    pg.click('[data-tab="tab-rutinas"]') if False else tab(pg, "rutinas")
    b = _rgb(pg, "[data-start-routine]", "backgroundColor")
    assert 210 <= _hue(b) <= 230, f"el botón Comenzar es azul: {b}"

@test
def azul_fondo_liso_sin_degradado_ni_difuminado(pg):
    seed(pg)
    for sel in ["body", "html"]:
        img = pg.evaluate("s => getComputedStyle(document.querySelector(s)).backgroundImage", sel)
        assert img == "none", f"{sel}: el fondo es liso, sin degradado: {img}"
    assert pg.evaluate("getComputedStyle(document.body, '::before').backgroundImage") in ("none", ""), "sin brillo detrás"

@test
def azul_claro_fondo_azulado_y_acento_azul(pg):
    seed(pg); _tema(pg, "light")
    assert _var(pg, "--fire").lower() == "#2563eb", _var(pg, "--fire")
    assert _var(pg, "--fire-text").lower() == "#1d4ed8"
    assert _contraste(_rgb(pg, "body", "color"), _rgb(pg, "body", "backgroundColor")) >= 7

@test
def azul_barra_de_estado_y_manifest_azul_noche(pg):
    seed(pg)
    assert pg.get_attribute('meta[name="theme-color"]', "content").lower() == "#0a1220"
    m = json.loads(open(os.path.join(ROOT, "manifest.webmanifest")).read())
    assert m["background_color"].lower() == "#0a1220" and m["theme_color"].lower() == "#0a1220", m

@test
def diseno_tokens_de_espaciado_radios_texto_y_movimiento(pg):
    seed(pg)
    for n, v in [("--s1", 4), ("--s2", 8), ("--s3", 12), ("--s4", 16), ("--s5", 20), ("--s6", 24), ("--s8", 32)]:
        assert _var(pg, n) == f"{v}px", f"{n} = {_var(pg, n)!r}: escala de 4 px"
    for n in ["--r-sm", "--r-md", "--r-lg", "--r-xl", "--r-full", "--t-xs", "--t-sm", "--t-md", "--t-base", "--t-lg", "--t-xl", "--t-2xl",
              "--shadow-1", "--shadow-2", "--shadow-3", "--d-fast", "--d-base", "--d-slow", "--ease-out", "--ease-spring",
              "--bg", "--surface", "--surface-2", "--surface-3", "--line", "--text", "--text-2", "--muted", "--fire", "--fire-text", "--on-fire", "--acid"]:
        assert _var(pg, n), f"falta el token {n}"
    for n in ["--d-fast", "--d-base", "--d-slow"]:
        ms = float(_var(pg, n).replace("ms", "")); assert 150 <= ms <= 350, f"{n} = {ms} ms: entre 150 y 350"

@test
def diseno_contraste_aa_en_oscuro_y_claro(pg):
    seed(pg)
    for t in ["dark", "light"]:
        _tema(pg, t)
        v = lambda n: _var(pg, n)
        pares = [("--text", "--bg"), ("--text", "--surface"), ("--text", "--surface-2"), ("--text-2", "--surface"),
                 ("--muted", "--bg"), ("--muted", "--surface"), ("--muted", "--surface-2"),
                 ("--fire-text", "--bg"), ("--fire-text", "--surface"), ("--fire-text", "--surface-2"),
                 ("--on-fire", "--fire"), ("--acid-text", "--surface"), ("--acid-text", "--bg"), ("--warn-text", "--surface"), ("--on-acid", "--acid")]
        for a, b in pares:
            c = _contraste(v(a), v(b))
            assert c >= 4.5, f"{t}: {a} sobre {b} = {c:.2f} (mínimo 4.5)"

@test
def diseno_hoja_de_estilos_sin_valores_sueltos(pg):
    css = open(os.path.join(ROOT, "styles.css")).read()
    cuerpo = css[css.index("/* ===== Base"):]
    import re
    sueltos = sorted(set(re.findall(r"(?<=[\s:(,])#[0-9a-fA-F]{3,8}(?=[;,\s)])", cuerpo)))
    assert not sueltos, f"colores fuera de los tokens: {sueltos}"
    assert cuerpo.count("!important") <= 6, f"{cuerpo.count('!important')} !important: la hoja debe ser una sola capa coherente"
    assert "clip-path: polygon" not in cuerpo and "skewX" not in cuerpo, "restos del estilo antiguo"
    assert re.search(r"\.btn:active[^{]*\{[^}]*scale\(\.97\)", css), "feedback al pulsar: escala 0.97"
    assert "font-display:swap" in open(os.path.join(ROOT, "fonts", "fonts.css")).read().replace(" ", "")

# ---------- Fase 2: Hoy ----------
@test
def hoy_punto_de_estado_late_mientras_falta_y_se_para_al_cumplir(pg):
    seed(pg, sessions=[], walks=[])
    an = lambda: pg.evaluate("getComputedStyle(document.getElementById('status-dot')).animationName")
    assert an() == "pulse", f"sin actividad hoy el punto late: {an()}"
    pg.evaluate("db.walks.push({id: 'wx', date: localDate(), seconds: 1200, meters: 1500, ts: Date.now()}); render()")
    assert an() == "none", f"al cumplir se queda fijo: {an()}"

@test
def hoy_la_racha_anima_el_numero_al_subir(pg):
    seed(pg, sessions=[], walks=[])
    assert "tick" not in (pg.get_attribute("#streak-n", "class") or ""), "al cargar no hay animación de cambio"
    pg.evaluate("db.walks.push({id: 'wx', date: localDate(), seconds: 1200, meters: 1500, ts: Date.now()}); render()")
    assert pg.inner_text("#streak-n") == "1"
    assert "tick" in (pg.get_attribute("#streak-n", "class") or ""), "el número entra animado al cambiar"

@test
def hoy_la_semana_es_un_boton_accesible_que_abre_el_calendario(pg):
    seed(pg)
    assert pg.get_attribute("#week", "role") == "button" and pg.get_attribute("#week", "tabindex") == "0"
    assert "calendario" in pg.get_attribute("#week", "aria-label").lower()
    pg.focus("#week"); pg.keyboard.press("Enter"); pg.wait_for_timeout(450)
    assert pg.is_visible("#cal-sheet"), "Enter sobre la semana abre el calendario"

# ---------- Fase 3: Rutinas ----------
@test
def rutinas_estado_vacio_con_titulo_icono_y_siguiente_paso(pg):
    seed(pg, routines=[], sessions=[]); tab(pg, "rutinas")
    e = pg.locator("#routines-list .empty")
    assert e.count() == 1 and e.locator("svg").count() == 1, "el estado vacío lleva icono"
    assert e.locator("b").inner_text().strip() == "Aún no tienes rutinas"
    assert "Crear rutina" in e.inner_text() and "Entreno libre" in e.inner_text(), e.inner_text()

@test
def rutinas_la_tarjeta_dice_cuando_fue_la_ultima_vez(pg):
    seed(pg); pg.evaluate("db.sessions.push({id: 'hoy1', date: localDate(), routine: 'PULL', sets: [{exercise: 'Remo', reps: 10, kg: 30, w: false}]}); render()")
    tab(pg, "rutinas")
    pull = pg.locator('#routines-list .routine', has=pg.locator('[data-open-routine="b"]')).locator(".rtitle small").inner_text()
    assert "Hoy" in pull, f"la rutina hecha hoy lo dice: {pull}"
    pg.evaluate("db.routines.push({id: 'z', name: 'NUEVA', exercises: []}); render()")
    z = pg.locator('#routines-list .routine', has=pg.locator('[data-open-routine="z"]')).locator(".rtitle small").inner_text()
    assert "Sin estrenar" in z, z

# ---------- Fase 4: Entreno en vivo ----------
@test
def entreno_barra_de_descanso_se_anima_con_transform(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click(); pg.wait_for_timeout(1300)
    st = pg.evaluate("(() => { const e = document.getElementById('rest-fill'), c = getComputedStyle(e); return {w: e.style.width, t: e.style.transform, prop: c.transitionProperty, origin: c.transformOrigin}; })()")
    assert st["w"] == "" and st["t"].startswith("scaleX("), f"la barra avanza con transform, no cambiando el ancho: {st}"
    assert st["prop"] == "transform" and st["origin"].startswith("0px"), st
    assert pg.get_attribute("#rest", "role") == "timer"

@test
def entreno_volumen_y_series_saltan_al_cambiar(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a"); pg.wait_for_timeout(300)
    assert "tick" not in (pg.get_attribute("#wk-sets", "class") or ""), "al abrir no salta nada"
    pg.locator(".wrow .chk").nth(1).click(); pg.wait_for_timeout(200)
    assert pg.inner_text("#wk-sets") == "1"
    assert "tick" in (pg.get_attribute("#wk-sets", "class") or "") and "tick" in (pg.get_attribute("#wk-vol", "class") or ""), "series y volumen saltan al marcar una serie"

@test
def entreno_check_de_serie_con_animacion_y_etiqueta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    chk = pg.locator(".wrow .chk").nth(1)
    assert chk.get_attribute("aria-label") == "Marcar serie como hecha" and chk.get_attribute("aria-pressed") == "false"
    chk.click(); pg.wait_for_timeout(100)
    chk = pg.locator(".wrow.done .chk").first
    assert chk.evaluate("e => getComputedStyle(e).animationName") == "checkpop"
    assert chk.get_attribute("aria-pressed") == "true"

# ---------- Fase 5: Historial ----------
_OBS = """sel => { window.__vals = []; const e = document.querySelector(sel);
  new MutationObserver(() => window.__vals.push(document.querySelector(sel)?.textContent)).observe(e.parentNode, {childList: true, characterData: true, subtree: true}); }"""

@test
def historial_fechas_faciles_de_leer(pg):
    seed(pg, sessions=[]); pg.evaluate("""() => { const d = new Date(); d.setDate(d.getDate() - 1); const ayer = localDate(d);
        db.sessions.push({id: 'h1', date: localDate(), routine: 'PUSH', sets: [{exercise: 'Press', reps: 5, kg: 10, w: false}]},
                         {id: 'h2', date: ayer, routine: 'PULL', sets: [{exercise: 'Remo', reps: 5, kg: 10, w: false}]},
                         {id: 'h3', date: '2024-03-05', routine: 'PIERNA', sets: [{exercise: 'Sentadilla', reps: 5, kg: 10, w: false}]}); render(); }""")
    tab(pg, "historial")
    fechas = pg.locator("#history-list .entry-head small").all_inner_texts()
    assert fechas == ["Hoy", "Ayer", "5 mar 2024"], fechas
    assert pg.locator("#history-list .entry-head small").first.get_attribute("title") == pg.evaluate("localDate()"), "la fecha exacta sigue disponible"

@test
def historial_estado_vacio_con_titulo_icono_y_siguiente_paso(pg):
    seed(pg, sessions=[], walks=[]); tab(pg, "historial")
    e = pg.locator("#history-list .empty")
    assert e.count() == 1 and e.locator("svg").count() == 1
    assert e.locator("b").inner_text().strip() == "Todavía no hay nada aquí"
    assert "Rutinas" in e.inner_text() and "Hoy" in e.inner_text(), e.inner_text()
    assert not pg.is_visible("#stats"), "sin datos no se enseñan tres ceros"

@test
def historial_los_contadores_cuentan_al_entrar(pg):
    seed(pg, sessions=[]); pg.evaluate("for (let i = 0; i < 24; i++) db.sessions.push({id: 'c' + i, date: '2026-10-' + String(i + 1).padStart(2, '0'), routine: 'PUSH', sets: [{exercise: 'Press', reps: 5, kg: 10, w: false}]}); render()")
    pg.evaluate(_OBS, "#stats .stat b"); tab(pg, "historial"); pg.wait_for_timeout(800)
    vals = pg.evaluate("window.__vals")
    assert pg.inner_text("#stats .stat b") == "24", pg.inner_text("#stats .stat b")
    assert len(set(vals)) >= 4 and vals[-1] == "24", f"el número sube hasta el valor final: {vals}"
    nums = [int(v) for v in vals]; assert nums == sorted(nums), f"siempre hacia arriba: {vals}"

@test
def historial_sin_cuenta_con_reduced_motion(pg):
    pg.emulate_media(reduced_motion="reduce")
    seed(pg, sessions=[]); pg.evaluate("for (let i = 0; i < 24; i++) db.sessions.push({id: 'c' + i, date: '2026-10-' + String(i + 1).padStart(2, '0'), routine: 'PUSH', sets: [{exercise: 'Press', reps: 5, kg: 10, w: false}]}); render()")
    pg.evaluate(_OBS, "#stats .stat b"); tab(pg, "historial"); pg.wait_for_timeout(500)
    assert pg.inner_text("#stats .stat b") == "24" and len(set(pg.evaluate("window.__vals"))) <= 1, pg.evaluate("window.__vals")

@test
def resumen_los_numeros_cuentan_hasta_el_total(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    f = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1)
    f.locator('input[data-f="kg"]').fill("50"); f.locator('input[data-f="reps"]').fill("10"); f.locator('[data-act="done"]').click(); pg.wait_for_timeout(150)
    pg.evaluate(_OBS, "#summary-vol")
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_selector("#summary-sheet.show", timeout=5000); pg.wait_for_timeout(800)
    vals = pg.evaluate("window.__vals")
    assert pg.inner_text("#summary-vol") == "500 kg", pg.inner_text("#summary-vol")
    assert len(set(vals)) >= 4 and vals[-1] == "500 kg", f"el volumen sube hasta el total: {vals}"

# ---------- Fase 6: Ajustes y hojas ----------
def _dedo(pg, sel, dy, pasos=8):
    """Arrastre vertical con dedo real (eventos táctiles por CDP) desde el centro de sel."""
    r = pg.locator(sel).bounding_box(); x, y = r["x"] + r["width"] / 2, r["y"] + 14
    cdp = pg.context.new_cdp_session(pg)
    cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x, "y": y}]})
    for i in range(1, pasos + 1):
        cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x, "y": y + dy * i / pasos}]}); pg.wait_for_timeout(16)
    cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}); pg.wait_for_timeout(600)

@test
def hojas_se_cierran_arrastrando_la_cabecera_hacia_abajo(pg):
    seed(pg)
    pg.click("#settings-btn"); pg.wait_for_timeout(450)
    _dedo(pg, "#settings-sheet .sheet-head", 30)
    assert pg.is_visible("#settings-sheet"), "un arrastre corto no cierra"
    assert pg.evaluate("document.getElementById('settings-sheet').style.transform") == "", "y la hoja vuelve a su sitio"
    _dedo(pg, "#settings-sheet .sheet-head", 240)
    assert not pg.is_visible("#settings-sheet") and "show" not in pg.get_attribute("#scrim", "class"), "arrastrar hacia abajo cierra la hoja"
    pg.click("#week"); pg.wait_for_timeout(450); _dedo(pg, "#cal-sheet .sheet-head", 240)
    assert not pg.is_visible("#cal-sheet"), "también el calendario"
    pg.click("#settings-btn"); pg.wait_for_timeout(450)
    assert pg.is_visible("#settings-sheet") and pg.evaluate("document.getElementById('settings-sheet').style.transform") == "", "se puede volver a abrir sin restos del arrastre"

@test
def hojas_escape_cierra_la_que_esta_abierta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click(); pg.click("#wk-finish"); pg.wait_for_timeout(450)
    assert pg.is_visible("#finish-sheet")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(450)
    assert not pg.is_visible("#finish-sheet") and pg.is_visible("#workout"), "Escape cierra la pregunta y el entreno sigue"

@test
def hojas_el_foco_entra_en_la_hoja_y_vuelve_al_cerrar(pg):
    seed(pg)
    pg.click("#settings-btn"); pg.wait_for_timeout(450)
    assert pg.evaluate("document.getElementById('settings-sheet').contains(document.activeElement)"), "al abrir, el foco pasa a la hoja"
    assert pg.evaluate("document.body.classList.contains('sheet-open')"), "y el fondo no se desplaza"
    pg.click("#settings-close"); pg.wait_for_timeout(450)
    assert pg.evaluate("document.activeElement.id") == "settings-btn", "al cerrar, el foco vuelve al botón que la abrió"
    assert not pg.evaluate("document.body.classList.contains('sheet-open')")

@test
def ajustes_opciones_con_estado_accesible(pg):
    seed(pg); pg.click("#settings-btn"); pg.wait_for_timeout(450)
    pg.click('[data-tema="light"]'); pg.wait_for_timeout(100)
    assert pg.get_attribute('[data-tema="light"]', "aria-pressed") == "true" and pg.get_attribute('[data-tema="dark"]', "aria-pressed") == "false"
    assert pg.evaluate("document.documentElement.dataset.theme") == "light"
    assert pg.get_attribute('meta[name="theme-color"]', "content").lower() == "#eef2f9", "la barra de estado sigue al tema"

@test
def diseno_respeta_reduced_motion(pg):
    pg.emulate_media(reduced_motion="reduce"); seed(pg); tab(pg, "rutinas"); pg.wait_for_timeout(100)
    d = pg.evaluate("[...document.querySelectorAll('.tab.active > *, .card, .btn, .sheet')].map(e => getComputedStyle(e)).map(c => Math.max(...(c.animationDuration + ',' + c.transitionDuration).split(',').map(parseFloat)))")
    assert d and max(d) <= 0.001, f"con reduced-motion no hay animaciones: {max(d)} s"

@test
def diseno_areas_tactiles_de_44_px(pg):
    seed(pg, sessions=SESIONES, walks=CAMINATAS)
    js = """() => [...document.querySelectorAll('button, a, label.btn, input:not([type=file]), select')].filter(e => e.offsetParent !== null && !e.closest('.cal-year')).map(e => { const r = e.getBoundingClientRect(); return [e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0], Math.round(r.width), Math.round(r.height)]; }).filter(x => x[1] < 44 || x[2] < 44).map(x => x.join(' '))"""
    malos = []
    def mira(n): malos.extend(f"{n}: {x}" for x in pg.evaluate(js))
    mira("hoy"); tab(pg, "rutinas"); mira("rutinas")
    tab(pg, "historial"); mira("historial")
    pg.click("#settings-btn"); pg.wait_for_timeout(450); mira("ajustes"); pg.keyboard.press("Escape"); pg.wait_for_timeout(450)
    tab(pg, "hoy"); pg.click("#week"); pg.wait_for_timeout(450); mira("calendario"); pg.keyboard.press("Escape"); pg.wait_for_timeout(450)
    tab(pg, "rutinas"); empezar(pg, "a"); pg.wait_for_timeout(300); mira("entreno")
    pg.locator(".wrow .chk").nth(1).click(); pg.wait_for_timeout(300); pg.click("#wk-finish"); pg.wait_for_timeout(450); mira("terminar")
    assert not malos, f"áreas táctiles menores de 44 px: {sorted(set(malos))}"

@test
def papel_fuentes_serif_y_manrope_cargadas(pg):
    seed(pg); pg.wait_for_timeout(400)
    assert "Manrope" in _rgb(pg, "body", "fontFamily")
    assert "Fraunces" in _rgb(pg, "h1", "fontFamily")
    ok = pg.evaluate("Promise.all([document.fonts.load('700 20px Fraunces'), document.fonts.load('700 20px Manrope')]).then(r => r.every(x => x.length > 0))")
    assert ok, "las fuentes Fraunces y Manrope deben cargarse desde la app"
    sw = open(os.path.join(ROOT, "sw.js")).read()
    for fn in ["Fraunces-600.woff2", "Fraunces-700.woff2", "Manrope-500.woff2", "Manrope-800.woff2"]:
        assert fn in sw, f"{fn} falta en ASSETS"

@test
def papel_textos_en_frase_no_en_mayusculas(pg):
    seed(pg); tab(pg, "rutinas")
    assert pg.inner_text('#routines-list [data-start-routine="a"]').strip() == "Comenzar"
    assert pg.inner_text('#routines-list [data-edit-routine="a"]').strip() == "Editar"
    assert pg.evaluate("getComputedStyle(document.querySelector('#routines-list [data-start-routine=\"a\"]')).textTransform") == "none"
    tab(pg, "hoy")
    assert pg.inner_text("#walk-start").strip() == "Empezar ya"
    assert pg.evaluate("getComputedStyle(document.querySelector('h1')).textTransform") == "none"

@test
def papel_formas_suaves_sin_cunas_ni_tajo(pg):
    seed(pg); tab(pg, "rutinas")
    assert _rgb(pg, ".card", "clipPath") == "none"
    assert float(_rgb(pg, ".card", "borderTopLeftRadius").replace("px", "")) >= 16
    b = pg.locator('#routines-list [data-start-routine="a"]')
    assert _rgb(pg, '#routines-list [data-start-routine="a"]', "clipPath") == "none"
    assert float(_rgb(pg, '#routines-list [data-start-routine="a"]', "borderTopLeftRadius").replace("px", "")) >= 12
    assert pg.evaluate("getComputedStyle(document.body, '::before').display") == "none", "sin tajo diagonal de fondo"

@test
def papel_barra_inferior_flotante_con_pildora(pg):
    seed(pg)
    t = pg.locator(".tabbar").bounding_box()
    assert t["x"] >= 10 and 390 - (t["x"] + t["width"]) >= 10, f"la barra debe flotar con margen lateral: {t}"
    assert 844 - (t["y"] + t["height"]) >= 8, "la barra debe flotar sobre el borde inferior"
    assert float(_rgb(pg, ".tabbar", "borderTopLeftRadius").replace("px", "")) >= 24

@test
def papel_tema_oscuro_sigue_siendo_legible(pg):
    seed(pg)
    pg.evaluate("localStorage.setItem('entreno-tema','dark')"); pg.reload(); pg.wait_for_timeout(300)
    def lum(c):
        r, g, b = [int(x) / 255 for x in c[c.index("(") + 1:c.index(")")].split(",")[:3]]
        f = lambda v: v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
        return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)
    bg, tx = _rgb(pg, "body", "backgroundColor"), _rgb(pg, "body", "color")
    a, b = sorted([lum(bg), lum(tx)])
    assert (b + .05) / (a + .05) >= 7, f"contraste {bg} / {tx}"
    assert lum(bg) < .1, "el oscuro debe ser oscuro"
    assert "Fraunces" in _rgb(pg, "h1", "fontFamily")


@test
def papel_ningun_texto_de_interfaz_en_mayusculas(pg):
    seed(pg)
    js = """() => [...document.querySelectorAll('.btn, .ring-sub, h3, h4, small, label, .chip, .tabbar span, .goal, .shead span, .whead span')]
      .filter(e => e.offsetParent !== null).map(e => e.innerText.trim()).filter(t => /[A-ZÁÉÍÓÚÑ]{4,}/.test(t) && t === t.toUpperCase())"""
    malos = []
    malos += pg.evaluate(js)
    tab(pg, "rutinas"); malos += pg.evaluate(js)
    pg.click("#settings-btn") if pg.locator("#settings-btn").count() else None
    pg.wait_for_timeout(200); malos += pg.evaluate(js)
    pg.keyboard.press("Escape")
    pg.evaluate("document.querySelectorAll('.sheet,.modal').forEach(e => e.hidden = true)")
    tab(pg, "rutinas"); empezar(pg, "a"); malos += pg.evaluate(js)
    assert not malos, f"textos en mayúsculas: {sorted(set(malos))}"

@test
def papel_ningun_cuadro_con_esquinas_cuadradas(pg):
    seed(pg, sessions=SESIONES, walks=CAMINATAS)
    js = """() => [...document.querySelectorAll('body *')].filter(e => {
        const r = e.getBoundingClientRect(), c = getComputedStyle(e);
        if (e.offsetParent === null || r.width < 24 || r.height < 24 || ['svg','path','circle','line'].includes(e.tagName.toLowerCase())) return false;
        const box = ['Top','Left','Right','Bottom'].every(s => parseFloat(c['border'+s+'Width']) > 0 && c['border'+s+'Style'] !== 'none');
        const sq = ['TopLeft','TopRight','BottomLeft','BottomRight'].every(k => parseFloat(c['border'+k+'Radius']) < 6);
        return box && sq;
      }).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0])"""
    malos = []
    def mira(nombre): malos.extend(f"{nombre}: {x}" for x in pg.evaluate(js))
    tab(pg, "hoy"); mira("hoy")
    tab(pg, "rutinas"); mira("rutinas")
    editar_rutina(pg, "a"); pg.wait_for_timeout(150); mira("editor de rutina")
    pg.click("#editor-cancel") if pg.locator("#editor-cancel").count() else pg.keyboard.press("Escape")
    tab(pg, "historial"); editar(pg, "session", "s2"); mira("editor de entreno")
    pg.click("#entry-cancel"); editar(pg, "walk", "w1"); mira("editor de caminata")
    pg.click("#entry-cancel")
    pg.click("#settings-btn"); pg.wait_for_timeout(250); mira("ajustes")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(450)
    tab(pg, "hoy"); pg.click("#week"); pg.wait_for_timeout(450); mira("calendario (mes)")
    pg.click('[data-calview="anio"]'); pg.wait_for_timeout(300); mira("calendario (año)")
    assert not malos, f"cuadros con esquinas cuadradas: {sorted(set(malos))}"

@test
def papel_hojas_inferiores_redondeadas_y_cabecera_a_todo_el_ancho(pg):
    seed(pg, sessions=SESIONES)
    def mide(abrir, sheet, nombre):
        abrir(); pg.wait_for_timeout(500)
        sh = pg.locator(sheet).bounding_box(); hd = pg.locator(f"{sheet} .sheet-head").bounding_box()
        c = pg.evaluate("([s]) => { const e = document.querySelector(s), h = e.querySelector('.sheet-head'), c = getComputedStyle(e), k = getComputedStyle(h); return {r: parseFloat(c.borderTopLeftRadius), r2: parseFloat(c.borderTopRightRadius), bt: c.borderTopWidth, bg: c.backgroundColor, hbg: k.backgroundColor}; }", [sheet])
        assert c["r"] >= 20 and c["r2"] >= 20, f"{nombre}: la hoja debe tener las esquinas de arriba redondeadas ({c})"
        assert c["bt"] == "0px", f"{nombre}: sin línea naranja en el borde superior ({c['bt']})"
        assert c["bg"] == c["hbg"], f"{nombre}: la cabecera debe tener el mismo fondo que la hoja ({c})"
        assert abs(hd["x"] - sh["x"]) < 1 and abs(hd["width"] - sh["width"]) < 18, f"{nombre}: la cabecera debe ocupar todo el ancho de la hoja ({hd} / {sh})"
    mide(lambda: pg.click("#settings-btn"), "#settings-sheet", "ajustes")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(450)
    mide(lambda: pg.click("#week"), "#cal-sheet", "calendario")

@test
def papel_entreno_cabecera_a_todo_el_ancho_y_panel_de_descanso_redondeado(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    fila = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1)
    fila.locator('input[data-f="kg"]').fill("50"); fila.locator('input[data-f="reps"]').fill("10"); fila.locator('[data-act="done"]').click(); pg.wait_for_timeout(500)
    h = pg.locator("#wk-in .wk-head").bounding_box()
    assert h["x"] <= 0.5 and abs(h["width"] - 390) <= 1, f"la cabecera fija debe ocupar todo el ancho para tapar las filas que pasan por detrás: {h}"
    assert _rgb(pg, "#wk-in .wk-head", "backgroundColor") == _rgb(pg, "#workout", "backgroundColor"), "mismo fondo que la pantalla"
    assert _rgb(pg, "#rest", "borderTopWidth") == "0px", "el panel de descanso no lleva línea recta arriba"
    assert float(_rgb(pg, "#rest", "borderTopLeftRadius").replace("px", "")) >= 20
    bar, rest = pg.locator("#rest .rest-bar").bounding_box(), pg.locator("#rest").bounding_box()
    assert bar["x"] >= rest["x"] + 12 and bar["x"] + bar["width"] <= rest["x"] + rest["width"] - 12, f"la barra de progreso va dentro del panel, no pegada a los bordes: {bar}"
    assert float(_rgb(pg, "#rest .rest-bar", "borderTopLeftRadius").replace("px", "")) >= 3
    assert _rgb(pg, "#wk-in .wk-stats small", "letterSpacing") in ("normal", "0px"), "etiquetas sin letras separadas"
    assert "¡YA!" not in open(os.path.join(ROOT, "workout.js")).read(), "el aviso final va en frase: ¡Ya!"

@test
def papel_serie_completada_banda_verde_suave_hasta_el_borde(pg):
    seed(pg); pg.evaluate("localStorage.setItem('entreno-tema','dark')"); pg.reload(); pg.wait_for_timeout(300); tab(pg, "rutinas"); empezar(pg, "a")
    ex = pg.locator("#wk-in .exblock").first
    f = ex.locator(".wrow:not(.whead)").nth(1)
    f.locator('input[data-f="kg"]').fill("50"); f.locator('input[data-f="reps"]').fill("10"); f.locator('[data-act="done"]').click(); pg.wait_for_timeout(400)
    cs = lambda loc, p: loc.evaluate("(e, p) => getComputedStyle(e)[p]", p)
    def rgb(c):
        d = c[c.index("(") + 1:c.index(")")].replace("/", " ").replace(",", " ").split()
        if d[0] == "srgb": return [float(x) * 255 for x in d[1:4]]
        return [float(x) for x in d[:3]]
    hecha, otra = ex.locator(".wrow.done"), ex.locator(".wrow:not(.done):not(.whead)").first
    assert hecha.count() == 1
    b = hecha.bounding_box()
    assert b["x"] <= 0.5 and abs(b["width"] - 390) <= 1, f"la banda verde llega hasta los bordes de la pantalla: {b}"
    assert cs(hecha, "boxShadow") == "none" and cs(hecha, "borderTopLeftRadius") == "0px", "sin contorno ni esquinas: es una banda"
    r, g, bl = rgb(cs(hecha, "backgroundColor"))
    assert g > r and g > bl, f"la banda es verde: {(r, g, bl)}"
    assert max(r, g, bl) < 90, f"la banda es oscura y suave, no deslumbra: {(r, g, bl)}"
    cr, cg, cb = rgb(cs(hecha.locator(".chk"), "backgroundColor"))
    assert cg > cr and cg > cb and cg <= 175, f"el check es verde medio, no fosforito: {(cr, cg, cb)}"
    assert cs(hecha.locator(".chk"), "boxShadow") == "none", "sin brillo alrededor del check"
    assert cs(hecha.locator("input").first, "color") == cs(otra.locator("input").first, "color"), "los números mantienen el color normal"


# ---------- Resumen al terminar el entreno ----------
def _termina_con_una_serie(pg, kg="50", reps="10"):
    f = pg.locator("#wk-in .exblock").first.locator(".wrow:not(.whead)").nth(1)
    f.locator('input[data-f="kg"]').fill(kg); f.locator('input[data-f="reps"]').fill(reps)
    f.locator('[data-act="done"]').click(); pg.wait_for_timeout(150)
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_selector("#summary-sheet.show", timeout=5000)

@test
def entreno_terminar_muestra_animacion_y_luego_resumen(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.locator(".wrow .chk").nth(1).click()
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_timeout(300)
    assert pg.get_attribute("#celebrate", "class").count("show") == 1, "primero la animación de entreno terminado"
    assert pg.inner_text("#cel-msg").strip() == "Entreno terminado", pg.inner_text("#cel-msg")
    assert not pg.is_visible("#summary-sheet"), "el resumen no tapa la animación"
    pg.wait_for_selector("#summary-sheet.show", timeout=5000)
    assert pg.get_attribute("#celebrate", "class").count("show") == 0, "la animación termina antes del resumen"

@test
def resumen_aparece_al_terminar_con_datos_del_entreno(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    _termina_con_una_serie(pg)
    pg.wait_for_selector("#summary-sheet.show", timeout=5000)
    assert pg.is_visible("#summary-sheet"), "al terminar se abre el resumen"
    assert pg.get_attribute("#summary-sheet", "aria-hidden") == "false"
    pg.wait_for_function("document.getElementById('summary-vol').textContent.trim() === '500 kg'", timeout=3000)  # fin del conteo animado
    txt = pg.inner_text("#summary-sheet")
    assert "¡Bien hecho!" in txt and "PUSH" in txt
    assert "Duración" in txt and "Volumen" in txt and "Series" in txt
    assert "500 kg" in txt, f"volumen de la sesión (50 × 10): {txt!r}"
    assert pg.locator("#summary-list .sum-ex").count() == 1, "solo los ejercicios con series hechas"
    assert "50 kg × 10" in pg.inner_text("#summary-list .sum-ex"), "mejor serie del ejercicio"
    assert pg.get_attribute("#summary-sheet", "class").count("show") == 1

@test
def resumen_se_cierra_con_listo_y_con_el_fondo(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    _termina_con_una_serie(pg)
    pg.click("#summary-done"); pg.wait_for_timeout(450)
    assert not pg.is_visible("#summary-sheet"), "Listo cierra el resumen"
    tab(pg, "rutinas"); empezar(pg, "a")
    _termina_con_una_serie(pg)
    pg.click("#scrim", position={"x": 5, "y": 5}); pg.wait_for_timeout(450)
    assert not pg.is_visible("#summary-sheet"), "tocar fuera también cierra el resumen"

@test
def resumen_no_aparece_si_el_entreno_se_descarta(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    pg.click("#wk-finish"); pg.wait_for_timeout(400)
    assert not pg.is_visible("#summary-sheet"), "sin series hechas no hay resumen"
    assert pg.is_visible("#toast") or "Entrenamiento descartado." in pg.content()

@test
def resumen_suma_todas_las_series_y_mejor_serie_por_ejercicio(pg):
    seed(pg); tab(pg, "rutinas"); empezar(pg, "a")
    ex = pg.locator("#wk-in .exblock").first
    pg.locator('#workout [data-act="addset"]').first.click(); pg.wait_for_timeout(120)
    for i, (kg, reps) in enumerate([("40", "10"), ("60", "8"), ("55", "12")], start=1):
        f = ex.locator(".wrow:not(.whead)").nth(i)
        f.locator('input[data-f="kg"]').fill(kg); f.locator('input[data-f="reps"]').fill(reps)
        f.locator('[data-act="done"]').click(); pg.wait_for_timeout(120)
    pg.click("#wk-finish"); pg.click("#finish-save"); pg.wait_for_selector("#summary-sheet.show", timeout=5000)
    assert "Series" in pg.inner_text("#summary-sheet")
    pg.wait_for_timeout(600)   # los números cuentan hasta el total
    assert pg.inner_text("#summary-sheet .sum-series").strip() == "3", "cuenta las series hechas"
    assert "60 kg × 8" in pg.inner_text("#summary-list .sum-ex"), "la mejor serie es la de más kg"
    assert pg.inner_text("#summary-sheet .sum-vol").replace(" ", "").startswith("1540"), "1540 kg = 400 + 480 + 660"


# ---------- Picker de ejercicios ----------
@test
def picker_ejercicios_se_abre_al_anadir_ejercicio(pg):
    seed(pg); tab(pg, "rutinas")
    pg.click("#new-routine")
    pg.click("#add-exercise")
    pg.wait_for_selector("#picker-sheet.show", timeout=2000)
    assert pg.is_visible("#picker-sheet"), "el picker de ejercicios no se abrió"
    assert pg.is_visible("#picker-search"), "el buscador se ve"
    assert pg.is_visible("#picker-filters"), "los filtros de categoría se ven"
    pg.click("#picker-close"); pg.wait_for_timeout(500)
    assert not pg.is_visible("#picker-sheet"), "el picker se cierra con el botón de cerrar"

@test
def picker_ejercicios_seleccionar_anade_a_la_rutina(pg):
    seed(pg); tab(pg, "rutinas")
    pg.click("#new-routine")
    n_inicial = pg.locator("#routine-exercises .exblock").count()
    pg.click("#add-exercise"); pg.wait_for_selector("#picker-sheet.show", timeout=2000)
    # Escribe nombre personalizado y lo añade
    pg.fill("#picker-search", "Sentadilla"); pg.wait_for_timeout(200)
    pg.locator("#picker-list .picker-custom").click(); pg.wait_for_timeout(300)
    assert not pg.is_visible("#picker-sheet"), "picker cerrado tras seleccionar"
    assert pg.locator("#routine-exercises .exblock").count() == n_inicial + 1, "se añadió el ejercicio"
    assert "Sentadilla" in pg.evaluate("[...document.querySelectorAll('.exname')].map(e => e.value)").pop()

def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=ROOT,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    failed = 0
    SEL = [t for t in TESTS if not sys.argv[1:] or any(a in t.__name__ for a in sys.argv[1:])]
    try:
        with sync_playwright() as p:
            br = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
            for t in SEL:
                ctx = br.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, service_workers="block")
                ctx.route("https://www.gstatic.com/firebasejs/**", lambda r: r.fulfill(body=open(os.path.join(ROOT, "tests", "fake_firebase.js")).read(), content_type="application/javascript"))
                pg = ctx.new_page(); pg.set_default_timeout(4000); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                try:
                    t(pg)
                    if errs: raise AssertionError(f"errores JS: {errs}")
                    print(f"  ok   {t.__name__}")
                except Exception as e:
                    import traceback
                    line = [f for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e.py")][-1]
                    failed += 1; print(f"  FAIL {t.__name__} (l.{line.lineno}: {line.line}): {str(e).splitlines()[0] if str(e) else ''}")
                ctx.close()
            br.close()
    finally:
        srv.terminate()
    print(f"\n{len(SEL) - failed}/{len(SEL)} tests pasan")
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
