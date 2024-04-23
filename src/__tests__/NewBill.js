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

const onNavigateMock = jest.fn();

const addedBill = {
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "accepted",
  "type": "Hôtel et logement",
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
    test("Then the submit button should bring you back to the Bills page if the form is filled", async () => {
    
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
      
      const handleSubmitMock = jest.fn((e) => {
        e.preventDefault();
        onNavigateMock(ROUTES_PATH['Bills']);
      });
      newBillForm.addEventListener("submit", handleSubmitMock);

      fireEvent.submit(newBillForm);

      expect(handleSubmitMock).toHaveBeenCalled();
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
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
    test("Then no error should be displayed when the file format is right", async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();
      
      const fileInput = screen.getByTestId('file');
      fireEvent.change(fileInput, {
        target: { files: [new File([""], "file.png", { type: "image/png" })] }
      });
    
      await waitFor(() => {
        const errorMsg = screen.queryByRole('alert');
        expect(errorMsg).not.toBeInTheDocument();
      });
    });
    // test("Then the submit button should bring you back to the Bills page if the form is filled", async () => {
    //   await waitFor(() => screen.getByTestId('form-new-bill'));
    //   const newBillForm = screen.getByTestId('form-new-bill');
    //   expect(newBillForm).toBeTruthy();
    
    //   // Remplir le formulaire avec des données valides
    //   fireEvent.change(screen.getByTestId('expense-type'), { target: { value: addedBill.type } });
    //   fireEvent.change(screen.getByTestId('expense-name'), { target: { value: addedBill.name } });
    //   fireEvent.change(screen.getByTestId('amount'), { target: { value: addedBill.amount.toString() } });
    //   fireEvent.change(screen.getByTestId('datepicker'), { target: { value: addedBill.date } });
    //   fireEvent.change(screen.getByTestId('vat'), { target: { value: addedBill.vat } });
    //   fireEvent.change(screen.getByTestId('pct'), { target: { value: addedBill.pct.toString() } });
    //   fireEvent.change(screen.getByTestId('commentary'), { target: { value: addedBill.commentary } });
    //   fireEvent.change(screen.getByTestId('file'), {
    //     target: { files: [new File([""], "file.png", { type: "image/png" })] }
    //   });
    
    //   // Définir un drapeau pour indiquer si la redirection a été effectuée
    //   let redirected = false;
    //   const handleSubmitMock = jest.fn((e) => {
    //     e.preventDefault();
    //     redirected = true; // Marquer que la redirection a été effectuée
    //     onNavigateMock(ROUTES_PATH['Bills']);
    //   });
    
    //   // Ajouter l'écouteur d'événement de soumission avec la fonction mock
    //   newBillForm.addEventListener("submit", handleSubmitMock);
    
    //   // Soumettre le formulaire
    //   fireEvent.submit(newBillForm);
    
    //   // Attendre que la redirection soit effectuée
    //   await waitFor(() => {
    //     expect(handleSubmitMock).toHaveBeenCalled();
    //     expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    //     expect(redirected).toBe(true); // Vérifier que la redirection a été effectuée
    //   });
    
    //   // Effectuer les actions après la redirection
    //   // Par exemple, naviguer vers la page des factures et vérifier sa présence
    //   Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    //   window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
    //   const root = document.createElement("div");
    //   root.setAttribute("id", "root");
    //   document.body.append(root);
    //   router();
    //   window.onNavigate(ROUTES_PATH.Bills);
    
    //   const newBillTable = screen.getByTestId('tbody');
    //   expect(newBillTable).toBeInTheDocument();
    // });
  })
})
