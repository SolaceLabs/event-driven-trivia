const defaultSession = {
  gameCode: '',
  clientCount: 5,
  chatCount: 2,
  lbRefreshCount: 5,
  scRefreshCount: 5
};

let conf = new (require('conf'))({'mocks': defaultSession});

const printMockConfig = () => {
  let mocks = getMockConfig();
  console.table(mocks);
}

const getMockConfig = () => {
  return conf.get('mocks');
}

const setMockConfig = (data) => {
  conf.set('mocks', data);
}

const resetMockConfig = () => {
  conf.set('mocks', defaultSession);
}

module.exports = { 
  getMockConfig, setMockConfig, resetMockConfig, printMockConfig
};
