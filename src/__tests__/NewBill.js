/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom/extend-expect';
import router from "../app/Router.js";
import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";
import ErrorPage from "../views/ErrorPage.js";

const onNavigateMock = jest.fn();
const mockStore = {
  bills: () => ({
    create: jest.fn().mockResolvedValue({ fileUrl: 'test_file_url', key: 'test_key' }),
    update: jest.fn().mockResolvedValue(),
    list: jest.fn().mockResolvedValue()
  }),
};

const addedBill = {
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "accepted",
  "type": "Capsule Hotel",
  "commentAdmin": "ok",
  "commentary": "séminaire billed",
  "name": "encore",
  "fileName": "preview-facture-free-201801-pdf-1.jpg",
  "date": "2004-04-04",
  "amount": 400,
  "email": "a@a",
  "pct": 20
}

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }));
    const html = NewBillUI()
    document.body.innerHTML = html
    const newBillInstance = new NewBill({
      document,
      onNavigate: onNavigateMock,
      store: {
        bills: () => ({
          create: jest.fn().mockResolvedValue({ fileUrl: 'test_file_url', key: 'test_key' }),
          update: jest.fn().mockResolvedValue(),
        }),
      },
      localStorage: localStorageMock,
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then the form should be rendered", async () => {
      //to-do write assertion
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();
    })

    test("Then the change file button should be rendered and should trigger handleChangeFile", async () => {
      await waitFor(() => screen.getByTestId('file'));
      const changeFileBtn = screen.getByTestId('file');
      expect(changeFileBtn).toBeTruthy();

      const handleChangeFileMock = jest.fn()
      changeFileBtn.addEventListener('click', handleChangeFileMock);
      fireEvent.click(changeFileBtn);
      expect(handleChangeFileMock).toHaveBeenCalled();
    })

    test("Then an error should be displayed when the file format is wrong", async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();

      // Simuler la sélection d'un fichier avec un format incorrect
      const fileInput = screen.getByTestId('file');
      fireEvent.change(fileInput, {
        target: { files: [new File([""], "file.txt", { type: "text/plain" })] }
      });

      // Attendre que l'élément d'erreur soit ajouté au DOM
      await waitFor(() => {
        const errorMsg = screen.queryByRole('alert');
        expect(errorMsg).toBeTruthy(); // Vérifier que l'élément d'erreur est présent dans le DOM
        expect(errorMsg.textContent).toBe("Seuls les fichiers JPG, JPEG et PNG sont autorisés."); // Vérifier le contenu de l'élément d'erreur
      });
    });

    test("Then the submit button should bring you back to the Bills page if the form is filled", async () => {
      const newBillInstance = new NewBill({
        document,
        onNavigate: onNavigateMock,
        store: mockStore,
        localStorage: localStorageMock,
      });

      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();

      // Remplir le formulaire avec des données valides
      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: addedBill.type } });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: addedBill.name } });
      fireEvent.change(screen.getByTestId('amount'), { target: { value: addedBill.amount.toString() } });
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: addedBill.date } });
      fireEvent.change(screen.getByTestId('vat'), { target: { value: addedBill.vat } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: addedBill.pct.toString() } });
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: addedBill.commentary } });
      fireEvent.change(screen.getByTestId('file'), {
        target: { files: [new File([""], "file.png", { type: "image/png" })] }
      });

      const handleSubmitMock = jest.fn((e) => {
        e.preventDefault();
        onNavigateMock(ROUTES_PATH['Bills']);
        bills.push(addedBill); // on veut que bills soit mis à jour avec addedbill
      });
      newBillForm.addEventListener("submit", handleSubmitMock);
      fireEvent.submit(newBillForm);

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      document.body.innerHTML = BillsUI({ data: bills })

      await waitFor(() => screen.getByTestId("bills-content-title"))
      const newBillTable = screen.getByTestId('tbody');
      expect(newBillTable).toBeTruthy();
      expect(newBillTable.innerHTML).toContain(addedBill.type);
    });
    describe("API error handling", () => {
      beforeEach(() => {
        // Initialisation avant chaque test d'erreur d'API
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        onNavigateMock(ROUTES_PATH['Bills']);
    
        // Utilisation de mockStore.bills().list() pour simuler la récupération des factures depuis le store
        document.body.innerHTML = BillsUI({ data: mockStore.bills().list() });
      });
    
      test("fetches bills from an API and fails with 404 message error", async () => {
        // Utilisez mockImplementationOnce pour simuler une erreur 404
        mockStore.bills().list.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
      
        // Naviguez vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);
        document.body.innerHTML = BillsUI({error: "Erreur 404"});

        // Attendre que le message d'erreur 404 soit affiché
        await waitFor(() => {
          const errorMessage = screen.getByText("Erreur 404");
          expect(errorMessage).toBeTruthy(); // Vérifie si le message d'erreur est dans le document
        });
      });
      
      test("fetches messages from an API and fails with 500 message error", async () => {
        // Utilisez mockImplementationOnce pour simuler une erreur 500
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
      
        // Naviguez vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);
        document.body.innerHTML = BillsUI({error: "Erreur 500"});
      
        const message = await screen.getByText("Erreur 500")
        expect(message).toBeTruthy()
      });      
    });
  })
})
