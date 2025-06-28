import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectItemAmount, setItemAmount } from '../../store/inventory';
import { DragSource } from '../../typings';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { fetchNui } from '../../utils/fetchNui';
import { Locale } from '../../store/locale';
import UsefulControls from './UsefulControls';
import AceUiControls from './AceEditUi';
import { url } from 'inspector';

const InventoryLogo = () => {
  const [exists, setExists] = useState(false);
  const imgUrl = 'public/ServerLogo/ServerLogo.png'; // Correct public path

  useEffect(() => {
    let isMounted = true;

    fetch(imgUrl, { method: 'HEAD' })
      .then(res => {
        if (isMounted) setExists(res.ok);
      })
      .catch(() => {
        if (isMounted) setExists(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return exists ? <img src={imgUrl} alt="Logo" style={{ width: '120px', height: 'auto', borderRadius: '5px' }}/> : null;
};



const InventoryControl: React.FC = () => {
  const itemAmount = useAppSelector(selectItemAmount);
  const dispatch = useAppDispatch();

  const [infoVisible, setInfoVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);


  const [, use] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      source.inventory === 'player' && onUse(source.item);
    },
  }));

  const [, give] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      source.inventory === 'player' && onGive(source.item);
    },
  }));

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.valueAsNumber =
      isNaN(event.target.valueAsNumber) || event.target.valueAsNumber < 0 ? 0 : Math.floor(event.target.valueAsNumber);
    dispatch(setItemAmount(event.target.valueAsNumber));
  };

  return (
    <>
    
      <UsefulControls infoVisible={infoVisible} setInfoVisible={setInfoVisible} />
            {/* AceUiControls modal */}
      <AceUiControls infoVisible={editVisible} setInfoVisible={setEditVisible} />
      <div className="inventory-control">
        <div className="inventory-control-wrapper">
          <InventoryLogo />
          <input
            className="inventory-control-input"
            type="number"
            defaultValue={itemAmount}
            onChange={inputHandler}
            min={0}
          />
          <button className="inventory-control-button" ref={use}>
            {Locale.ui_use || 'Use'}
          </button>
          <button className="inventory-control-button" ref={give}>
            {Locale.ui_give || 'Give'}
          </button>
          <button className="inventory-control-button" onClick={() => fetchNui('exit')}>
            {Locale.ui_close || 'Close'}
          </button>
        </div>
      </div>

      <button className="useful-controls-button" onClick={() => setInfoVisible(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 524 524">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
        </svg>
      </button>

            {/* Button to open AceUiControls (Edit button) modal */}
      <button className="ace-ui-controls-button" onClick={() => setEditVisible(true)}>
        <i className="fa-duotone fa-solid fa-pen-to-square" style={{ fontSize: '1.5em' }}></i>
      </button>
    </>
  );
};

export default InventoryControl;
