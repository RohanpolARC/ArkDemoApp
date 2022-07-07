export async function getSharedEntities(adaptableId){

    return new Promise(resolve => {
      this.subscriptions.push(this.dataSvc.getAdaptableState(adaptableId).subscribe({
        next: state => {
          try {

            state = state.split('|').join('"')
            resolve(JSON.parse(state) ||'[]')
          } catch (e) {
            console.log("Failed to parse")
            resolve([])
          }
        }
      }));
    })
  }

export async function setSharedEntities(adaptableId, sharedEntities): Promise<void>{

    return new Promise(resolve => {
      this.subscriptions.push(
        this.dataSvc.saveAdaptableState(adaptableId, JSON.stringify(sharedEntities).replace(/"/g,'|')).subscribe({
        next: data => {
          resolve();
        }
      }));
    })
  }
