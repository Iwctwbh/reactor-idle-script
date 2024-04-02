if (typeof global !== 'undefined') {
  alert('已有在执行的脚本，请刷新页面后再执行。');
} else {
  alert('加载脚本ing，如遇到存档问题请刷新页面后再次执行该脚本。');
  var global;
  requirejs.config({
    baseUrl: 'js',
    urlArgs: 'bust=' + new Date().getTime(),
    packages: [],
    paths: {
      template: '../template',
      BigNumber: 'lib/BigNumber',
      BigNumberSlow: 'lib/BigNumberSlow',
      BigNumberFast: 'lib/BigNumberFast',
      handlebars: 'lib/handlebars',
      text: 'lib/text',
      logger: 'base/logger',
      numberFormat: 'base/numberFormat',
      Main: 'Main',
      config: 'config',
      game: 'game',
      actions: 'game/actions',
      strategies: 'game/strategies',
      calculators: 'game/calculators',
      ui: 'ui',
    },
  }),
    (String.prototype.lcFirst = function () {
      return this.charAt(0).toLowerCase() + this.slice(1);
    }),
    require(['handlebars', 'text'], function () {
      require([
        'Main',
        'base/server/Kongregate',
        'base/server/Paypal',
        'base/server/Dummy',
        'base/ConfirmedTimestamp',
        'base/GoogleAdds',
        'base/UrlHandler',
        'logger',
        'numberFormat',
        'config/Event/GameEvent',
        'config/Event/ReactorEvent',
        'config/Event/UiEvent',
      ], function (e, t, a, i, r, n, s) {
        r.load(function () {
          var i = new e(),
            r = null,
            o = s.identifySite();
          (r = 'kongregate' == o ? new t(i) : new a(i)),
            i.setExternalApi(r),
            i.init(!0),
            setTimeout(function () {
              'direct' == o && n.init();
            }, 1e3);
          var circul = () => {
            global = i;
            setTimeout(() => circul(), 1);
          };
          circul();
        });
      });
    });

  setTimeout(() => {
    global.ui.container.on('mouseover', '.componentButton', (e) => {
      let id = $(e.target).attr('data-id');
      let component = global.game.getMeta().componentsById[id];
      let strategy = component.strategy;
      let reactor = global.ui.gameUi.reactor;
      if (strategy.hasOwnProperty('powerProduction')) {
        let sum_power =
          strategy.powerProduction *
          reactor.getUpgradeBonuses().components[id]
            .powerProductionMultiplayer *
          component.lifetime *
          reactor.getUpgradeBonuses().components[id].lifetimeMultiplayer;
        let sum_profit = sum_power - component.price;
        let second_profit =
          sum_profit /
          (component.lifetime *
            reactor.getUpgradeBonuses().components[id].lifetimeMultiplayer);
        global.ui.container.find('.infoText')[0].innerHTML +=
          `<span class="extra max">生产总能量: ${numberFormat.format(
            sum_power
          )}</span>` +
          `<br />` +
          `<span class="extra max">总纯利润: ${numberFormat.format(
            sum_profit
          )}</span>` +
          `<br />` +
          `<span class="extra max">平均每秒纯利润: ${numberFormat.format(
            second_profit
          )}</span>`;
      } else if (strategy.hasOwnProperty('heatProduction')) {
        let sum_power =
          strategy.heatProduction *
          reactor.getUpgradeBonuses().components[id].heatProductionMultiplayer *
          component.lifetime *
          reactor.getUpgradeBonuses().components[id].lifetimeMultiplayer;
        let sum_profit = sum_power - component.price;
        let second_profit =
          sum_profit /
          (component.lifetime *
            reactor.getUpgradeBonuses().components[id].lifetimeMultiplayer);
        global.ui.container.find('.infoText')[0].innerHTML +=
          `<span class="extra max">生产总热量: ${numberFormat.format(
            sum_power
          )}</span>` +
          `<br />` +
          `<span class="extra max">总纯利润: ${numberFormat.format(
            sum_profit
          )}</span>` +
          `<br />` +
          `<span class="extra max">平均每秒纯利润: ${numberFormat.format(
            second_profit
          )}</span>`;
      }
    });
  }, 1000);

  var fixHeight = () => {
    $('.infoText').height(120);
    setTimeout(() => fixHeight(), 100);
  };
  fixHeight();
  setTimeout(() => {
    var needHeatAlert = true;
    var showBuilds = () => {
      if (global.ui.gameUi) {
        $('#rightCommercial')[0].innerHTML = `建造预览：` + `<br />`;
        $('#rightCommercial')[0].innerHTML += Object.entries(
          global.ui.gameUi.reactor.tiles
            .filter((f) => f.meta)
            .map((m) => {
              if (global.interval && needHeatAlert) {
                let component = global.game.getMeta().componentsById[m.meta.id];
                let strategy = component.strategy;
                let reactor = global.ui.gameUi.reactor;
                if (
                  m.heat /
                    (component.maxHeat *
                      reactor.getUpgradeBonuses().components[m.meta.id]
                        .maxHeatMultiplayer) >
                  0.9
                ) {
                  $('#stopButton').click();
                  global.game.eventManager.invokeEvent('pauseTime');
                  needHeatAlert = false;
                  alert('有组件过热！');
                  setTimeout(() => {
                    needHeatAlert = true;
                  }, 5000);
                }
              }
              return m;
            })
            .reduce((result, currentItem) => {
              (result[currentItem['meta']['id']] =
                result[currentItem['meta']['id']] || []).push(currentItem);
              return result;
            }, {})
        )
          .map(([key, value]) => {
            let component = global.game.getMeta().componentsById[key];
            let strategy = component.strategy;
            let reactor = global.ui.gameUi.reactor;
            if (strategy.hasOwnProperty('powerProduction')) {
              return (
                `${component.name}: ${
                  value.length
                }    总能量：${numberFormat.format(
                  strategy.powerProduction *
                    reactor.getUpgradeBonuses().components[key]
                      .powerProductionMultiplayer *
                    value.length
                )}` + `<br />`
              );
            } else if (strategy.hasOwnProperty('heatProduction')) {
              return (
                `${component.name}: ${
                  value.length
                }    总热量：${numberFormat.format(
                  strategy.heatProduction *
                    reactor.getUpgradeBonuses().components[key]
                      .heatProductionMultiplayer *
                    value.length
                )}` + `<br />`
              );
            } else if (strategy.hasOwnProperty('convertHeatToPower')) {
              return (
                `${component.name}: ${
                  value.length
                }    最大总转换热量：${numberFormat.format(
                  strategy.convertHeatToPower *
                    reactor.getUpgradeBonuses().components[key]
                      .heatToPowerConversionMultiplayer *
                    value.length
                )}` + `<br />`
              );
            } else {
              return `${component.name}: ${value.length}` + `<br />`;
            }
          })
          .join('');
      } else {
        $('#rightCommercial')[0].innerHTML = ``;
      }
      setTimeout(() => showBuilds(), 100);
    };
    showBuilds();
  }, 1000);

  setTimeout(() => {
    let oldVersion = global.saveHandler.saveVersion;
    if (window.localStorage[`${global.saveHandler.saveVariable}999`]) {
      let totalMoney = JSON.parse(
        LZString.decompressFromBase64(
          window.localStorage[`${global.saveHandler.saveVariable}${oldVersion}`]
        )
      )[7];
      let totalMoney999 = JSON.parse(
        LZString.decompressFromBase64(
          window.localStorage[`${global.saveHandler.saveVariable}999`]
        ) ?? '{}'
      )[7];

      let loadVersion = totalMoney > totalMoney999 ? oldVersion : 999;

      global.saveHandler.saveVersion = loadVersion;
    }
    global.saveHandler.updateFromSaveData(
      global.saveHandler.loadFromStorage(),
      !0
    );
    var save = () => {
      window.localStorage[global.saveHandler.saveVariable + oldVersion] =
        global.saveHandler.getSaveData();
      window.localStorage.reactorIdleUserHash = global.saveHandler.main
        .getSaveHandler()
        .getUserHash();
      window.localStorage[global.saveHandler.saveVariable + '999'] =
        global.saveHandler.getSaveData();
      setTimeout(() => save(), 100);
    };
    save();
  }, 1000);
}
