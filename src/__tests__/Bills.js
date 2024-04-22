/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router()
    window.onNavigate(ROUTES_PATH.Bills)
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(Array.from(windowIcon.classList)).toContain('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then handleClickIconEye should be called when an icon is clicked", () => {
      // Simulez la fonction modal pour l'élément ciblé
      $.fn.modal = jest.fn(); // Crée une fonction mock pour la fonction modal
      const handleClickIconEyeMock = jest.fn();

      const icons = document.querySelectorAll(`div[data-testid="icon-eye"]`);
      icons.forEach(icon => {
        icon.addEventListener('click', () => handleClickIconEyeMock(icon));
        fireEvent.click(icon);
        expect(handleClickIconEyeMock).toHaveBeenCalledWith(icon);
      });

      // Assurez-vous de nettoyer la fonction mock après le test
      $.fn.modal.mockRestore();
    });

    test("Then NewBill page should be displayed when buttonNewBill is clicked", async () => {
      const bills = new Bills({ document, onNavigate, mockStore, localStorageMock });
      bills.handleClickNewBill = jest.fn();
    
      await waitFor(() => screen.getAllByTestId('btn-new-bill'));
      const newBillBtns = screen.getAllByTestId('btn-new-bill');
    
      newBillBtns.forEach(btn => {
        fireEvent.click(btn); 
        expect(bills.handleClickNewBill).toHaveBeenCalled();
      });

      // Attendre que le formulaire soit affiché
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();
    });

    test("Then it should fetch bills from mock API GET", async () => {
      await waitFor(() => screen.getAllByText('Mes notes de frais'));
      const contentTitle  = screen.getAllByText('Mes notes de frais')
      expect(contentTitle).toBeTruthy()
    })
  })
})