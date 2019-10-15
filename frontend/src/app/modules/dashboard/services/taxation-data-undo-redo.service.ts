import { Injectable } from '@angular/core';
import { AuthenticationService } from '../../core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class TaxationDataUndoRedoService {

  private undoRedoLimit = 15;
  private undoArray = [];
  private redoArray = [];

  public undoRedoButtons = {
    showUndo: false,
    showRedo: false
  }

  public showUndo = false;
  public showRedo = false;

  constructor(private authenticationService:AuthenticationService) { }

  addToUndo(item){
    if(this.undoArray.length==this.undoRedoLimit){
      this.undoArray.shift();
      this.undoArray.push(item);
    }else{
      this.undoArray.push(item);
      this.undoRedoButtons.showUndo = true;
    }
    this.redoArray = [];
    this.undoRedoButtons.showRedo = false;
  }

  undo(taxList){
    let returnVal = '';
    if(this.undoArray.length!=0){
      let actionItem = this.undoArray.pop();
      if(actionItem.action == "shuffle"){
        let shuffledIndices = actionItem.data;
        taxList.forEach(function(item, index){
          item.shuffleIndex = shuffledIndices[index];
        });
        taxList.sort((a,b)=>{
          return a.shuffleIndex - b.shuffleIndex;
        });
        taxList.forEach(function(item){
          delete item.shuffleIndex;
        });
        
        actionItem = this.undoArray.pop();
      }
      if(actionItem){
        this.redoArray.push(actionItem);
        this.undoRedoButtons.showRedo = true;
      }



      switch(actionItem.action){
        case 'delete': {
          for(let i=actionItem.data.length-1;i>=0;i--){
            let data = actionItem.data[i];
            taxList.splice(data.rowIndex, 0, JSON.parse(data.rowData));
          }
          break;
        }
        case 'merge': {
          for(let i=actionItem.data.length-1;i>=1;i--){
            let data = actionItem.data[i];
            taxList.splice(data.rowIndex, 0, JSON.parse(data.rowData));
          }
          //taxList.splice(actionItem.data[0].rowIndex, 1, JSON.parse(actionItem.data[0].rowData));
          taxList[actionItem.data[0].rowIndex] = JSON.parse(actionItem.data[0].rowData);
          break;
        }
        case 'addrow': {
          taxList.splice(actionItem.data[0].rowIndex, 1);
          break;
        }
        case 'edit': {
          let rowIndex = actionItem.data[0].rowIndex;
          let field =  actionItem.data[0].field;
          let oldValue = actionItem.data[0].oldValue;
          taxList[rowIndex][field] = oldValue;
          returnVal = taxList[rowIndex];
          break;
        }
      }

      if(this.undoArray.length == 0){
        this.undoRedoButtons.showUndo = false;
      }
    }
    return returnVal;
  }

  redo(taxList){
    let returnVal = '';
    if (this.redoArray.length != 0) {    
      let actionItem = this.redoArray.pop();
      this.undoArray.push(actionItem);

      switch(actionItem.action){
        case 'delete': {
          for(let i=0;i<actionItem.data.length;i++){
            let data = actionItem.data[i];
            taxList.splice(data.rowIndex, 1);
          }
          break;
        }
        case 'merge':{
          for(let i=1;i<actionItem.data.length;i++){
            let data = actionItem.data[i];
            taxList.splice(data.rowIndex, 1);
          }
          //taxList.splice(actionItem.result.resultIndex, 1, JSON.parse(actionItem.result.resultData));
          taxList[actionItem.result.resultIndex] = JSON.parse(actionItem.result.resultData);
          break;
        }
        case 'addrow': {
          taxList.splice(actionItem.data[0].rowIndex, 0, JSON.parse(actionItem.data[0].rowData));
          break;
        }
        case 'edit': {
          let rowIndex = actionItem.data[0].rowIndex;
          let field =  actionItem.data[0].field;
          let newValue = actionItem.data[0].newValue;
          taxList[rowIndex][field] = newValue;
          returnVal = taxList[rowIndex];
          break;
        }
      }

      if (this.redoArray.length == 0) {
        this.undoRedoButtons.showRedo = false;
      }
    }

    if (this.undoArray.length > 0) {
      this.undoRedoButtons.showUndo = true;
    } else {
      this.undoRedoButtons.showUndo = false;
    }  
    return returnVal;
  }

  updateUndoIndices(updatedRowIndices){
    console.log(updatedRowIndices);
    let isSorted = false;
    for(let i=0;i<updatedRowIndices.length;i++){
      if(updatedRowIndices[i]!=i){
        isSorted = true;
        break;
      }
    }
    if(isSorted){
      /*this.undoArray = this.undoArray.map(item=>{
        for(let i=0;i<item.data.length;i++){
          if(item.action=="edit"){
            let numberOfDeleteOps=0;
            let itemIndex = this.undoArray.indexOf(item);
            for(let k=itemIndex;k<this.undoArray.length;k++){
              if(this.undoArray[k].action == "delete"){
                for(let y=0;y<this.undoArray[k].data.length;y++){
                  if(this.undoArray[k].data[y].rowIndex<item.data[i].rowIndex){
                    numberOfDeleteOps++;
                  }
                }
              }else if(this.undoArray[k].action == "merge"){
                for(let y=1;y<this.undoArray[k].data.length;y++){
                  if(this.undoArray[k].data[y].rowIndex<item.data[i].rowIndex){
                    numberOfDeleteOps++;
                  }
                }
              }
            }
            item.data[i].rowIndex = updatedRowIndices.indexOf(item.data[i].rowIndex-numberOfDeleteOps);
          }else{
            item.data[i].rowIndex = updatedRowIndices.indexOf(item.data[i].rowIndex);
          }
        }
        if(item.action == "merge"){
          item.result.resultIndex = updatedRowIndices.indexOf(item.result.resultIndex);
        }
        return item;
      });
      this.redoArray = [];
      this.undoRedoButtons.showRedo = false;*/
      let undoShuffle = {action:"shuffle", data: updatedRowIndices};
      this.undoArray.push(undoShuffle);
    }
  }

  clearUndoRedo(){
    this.undoArray = [];
    this.redoArray = [];
    this.undoRedoButtons.showUndo = false;
    this.undoRedoButtons.showRedo = false;
    this.removeFromLocalSorage();
  }

  saveToLocalStorage(){
    let undoredo = {  u: this.undoArray, r: this.redoArray };
    this.authenticationService.setItem("undoredo",JSON.stringify(undoredo));
  }

  removeFromLocalSorage(){
    this.authenticationService.removeItem("undoredo");
  }

  setUndoRedoFromLocalStorage(){
    let undoRedo;
    try{
      undoRedo = JSON.parse(this.authenticationService.getItem("undoredo"));
      this.undoArray = undoRedo.u;
      this.redoArray = undoRedo.r;
      this.undoRedoButtons.showUndo = (this.undoArray.length)?true:false;
      this.undoRedoButtons.showRedo = (this.redoArray.length)?true:false;
    }catch(e){}
  }

}
