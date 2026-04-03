/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPanel from './pages/AdminPanel';
import Ajustes from './pages/Ajustes';
import Automatizaciones from './pages/Automatizaciones';
import Cocina from './pages/Cocina';
import Comunicaciones from './pages/Comunicaciones';
import DetallePresupuesto from './pages/DetallePresupuesto';
import Eventos from './pages/Eventos';
import Finanzas from './pages/Finanzas';
import GestionClientes from './pages/GestionClientes';
import GestionMenu from './pages/GestionMenu';
import Login from './pages/Login';
import MenuEvento from './pages/MenuEvento';
import MisPresupuestos from './pages/MisPresupuestos';
import NuevoPresupuesto from './pages/NuevoPresupuesto';
import Perfil from './pages/Perfil';
import PlanificadorSala from './pages/PlanificadorSala';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import Registro from './pages/Registro';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPanel": AdminPanel,
    "Ajustes": Ajustes,
    "Automatizaciones": Automatizaciones,
    "Cocina": Cocina,
    "Comunicaciones": Comunicaciones,
    "DetallePresupuesto": DetallePresupuesto,
    "Eventos": Eventos,
    "Finanzas": Finanzas,
    "GestionClientes": GestionClientes,
    "GestionMenu": GestionMenu,
    "Login": Login,
    "MenuEvento": MenuEvento,
    "MisPresupuestos": MisPresupuestos,
    "NuevoPresupuesto": NuevoPresupuesto,
    "Perfil": Perfil,
    "PlanificadorSala": PlanificadorSala,
    "PoliticaPrivacidad": PoliticaPrivacidad,
    "Registro": Registro,
}

export const pagesConfig = {
    mainPage: "Login",
    Pages: PAGES,
    Layout: __Layout,
};
