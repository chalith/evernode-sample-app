import './App.css'
import { useCallback, useEffect, useState } from "react";
import ContractService from "./service/contract-service";

function App() {
  const [isContractInitiated, setIsContractInitiated] = useState(false);
  const [data, setData] = useState(null);


  useEffect(() => {
    ContractService.instance.init().then(res => {
      setIsContractInitiated(true);
    });
  }, []);

  const add = useCallback(async () => {
    setData('Loading...');
    const res = await ContractService.instance.submitInputToContract({
      type: 'add',
      content: {
        name: 'React',
        date: '24-08-2023',
        instructor: 'Adam Queue',
        duration: 2
      }
    });
    setData(res || 'No Data');
  }, []);

  const list = useCallback(async () => {
    setData('Loading...');
    const res = await ContractService.instance.submitReadRequest({
      type: 'list'
    });
    setData(res || 'No Data');
  }, []);

  const get = useCallback(async () => {
    setData('Loading...');
    const res = await ContractService.instance.submitReadRequest({
      type: 'get',
      content: {
        id: 1
      }
    });
    setData(res || 'No Data');
  }, []);

  return (
    <div className="container p-5">
      {
        isContractInitiated ?
          <>
            <div className="col-12 p-1 d-flex justify-content-center">
              <button className="btn btn-primary" onClick={add}>Add Data</button>
            </div>
            <div className="col-12 p-1 d-flex justify-content-center">
              <button className="btn btn-primary" onClick={list}>List Data</button>
            </div>
            <div className="col-12 p-1 d-flex justify-content-center">
              <button className="btn btn-primary" onClick={get}>Get Data</button>
            </div>
            {
              data && <div className="col-12 mt-4 d-flex justify-content-center">
                <pre className="p-2 border">
                  {typeof data == 'object' ? JSON.stringify(data, null, 4) : data}
                </pre>
              </div>
            }
          </> :
          <div className="col-12 p-1 d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
      }
    </div>
  );
}

export default App;
