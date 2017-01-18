angular.module("ConstantModule",[]).
constant("All" ,{
	Ip:"172.16.73.97:9900",
	webSockUrl:"ws://172.16.66.170:8787/monitor/123/",
	hisDealUrl:"./mock/his1.json",
	hisOrderUrl:"./mock/his2.json",
	hisXswapUrl:"./mock/his3.json",
	hisDetailedInfoUrl:"./mock/his2-1.json",
	quoteNav: ["类型","产品","期限","ofr","bid","ofr.vol","bid.vol","交易员"],
	user:"佚名",
	infoList: [],
    QUOTE_FREEZE : 'quote-freeze', //quote freeze style.
    single: [
       {
           "type": "Outright",
           "product": [{"key":"Repo"},{"key":"Shibor"},{"key":"Shibor6M"},{"key":"Depo"},{"key":"ShiborON"}],
           "date":[{"key":"1M"},{"key":"2M"},{"key":"3M"},{"key":"6M"},{"key":"9M"},{"key":"1Y"},{"key":"2Y"},{"key":"3Y"},{"key":"4Y"},{"key":"5Y"},{"key":"7Y"},{"key":"10Y"}]
       },
       {
           "type": "Spread",
           "product": [{"key":"Repo"},{"key":"Shibor"},{"key":"Shibor6M"},{"key":"Depo"},{"key":"ShiborON"}],
           "date":[{"key":"6M*9M"},{"key":"6M*1Y"},{"key":"9M*1Y"},{"key":"1Y*2Y"},{"key":"1Y*3Y"},{"key":"1Y*5Y"},{"key":"2Y*3Y"},{"key":"2Y*5Y"},{"key":"3Y*4Y"},{"key":"3Y*5Y"},{"key":"4Y*5Y"}]
       }
    ],
	addSingle: [
       {
           "type": "Outright",
           "product": ["All","Repo","Shibor","Shibor6M","Depo","ShiborON"],
           "date":["All","1M","2M","3M","6M","9M","1Y","2Y","3Y","4Y","5Y","7Y","10Y"]
       },
       {
           "type": "Spread",
           "product": ["All","Repo","Shibor","Shibor6M","Depo","ShiborON"],
           "date":["All","6M*9M","6M*1Y","9M*1Y","1Y*2Y","1Y*3Y","1Y*5Y","2Y*3Y","2Y*5Y","3Y*4Y","3Y*5Y","4Y*5Y"]
       }
    ],
	hisDealGridOption : [
        {name: 'index', displayName: '序号', width: '5%'},
        {name: 'number', displayName: '成交编号', width: '10%'},
        {name: 'quoteNumber', displayName: '报价编号'},
        {name: 'orderNumber', displayName: 'x-swap订单编号', width: '10%'},
        {name: 'status', displayName: '成交状态'},
        {name: 'type', displayName: '合约品种'},
        {name: 'term', displayName: '期限'},
        {name: 'prices', displayName: '价格(%,BP)'},
        {name: 'count', displayName: '数量'},
        {name: 'tradingDirection', displayName: '交易方向'},
        {name: 'counterparty', displayName: '对手方'},
        {name: 'dealer', displayName: '对手交易员'},
        {name: 'remark', displayName: '备注'},
        {name: 'time', displayName: '成交时间', width: '10%'}
    ],
    hisOrderGridOption : [
        {name: 'index', displayName: '序号', width: '5%'},
        {name: 'number', displayName: '报价编号'},
        {name: 'type', displayName: '合约品种'},
        {name: 'term', displayName: '期限'},
        {name: 'tradingDirection', displayName: '交易方向'},
        {name: 'prices', displayName: '价格(%,BP)'},
        {name: 'count', displayName: '数量'},
        {name: 'dealY', displayName: '已成交数量'},
        {name: 'dealN', displayName: '未成交数量'},
        {name: 'state', displayName: '订单状态'},
        {name: 'time', displayName: '最后更新时间'}
    ],
    hisXswapGridOption : [
        {name: 'index', displayName: '序号', width: '5%'},
        {name: 'orderNumber', displayName: 'x-swap订单编号', width: '10%'},
        {name: 'number', displayName: '报价编号'},
        {name: 'type', displayName: '合约品种'},
        {name: 'term', displayName: '期限'},
        {name: 'tradingDirection', displayName: '交易方向'},
        {name: 'prices', displayName: '价格(%,BP)'},
        {name: 'dealN', displayName: '未成交数量'},
        {name: 'dealY', displayName: '已成交数量'},
        {name: 'state', displayName: 'x-swap订单状态'},
        {name: 'time', displayName: '最后更新时间'},
        {name: 'note', displayName: '备注', width: '5%'}
    ],
    mainGridSetOption : [
        {name: 'productKey', displayName: '合约品种_期限', nowState: true,change:false},
        {name: 'myOfr', displayName: '我的ofr', nowState: true,change:false},
        {name: 'myOfrVol', displayName: '我的Ofr vol.', nowState: true,change:false},
        {name: 'myBid', displayName: '我的bid', nowState: true,change:false},
        {name: 'myBidVol', displayName: '我的bid vol.', nowState: true,change:false},
        {name: 'mktOfr', displayName: '市场ofr', nowState: true,change:false},
        {name: 'mktOfrVol', displayName: '市场ofr vol.', nowState: true,change:false},
        {name: 'mktOfrSource', displayName: '市场ofr来源', nowState: true,change:false},
        {name: 'mktOfrUpdateTime', displayName: '市场ofr更新', nowState: true,change:false},
        {name: 'mktBid', displayName: '市场bid', nowState: true,change:false},
        {name: 'mktBidVol', displayName: '市场bid vol.', nowState: true,change:false},
        {name: 'mktBidSource', displayName: '市场bid来源', nowState: true,change:false},
        {name: 'mktBidTime', displayName: '市场bid更新', nowState: true,change:false},
        {name: 'mktMidPrice', displayName: '市场中间价', nowState: true,change:false},
        {name: 'prevClosePrice', displayName: '昨日收盘价', nowState: true,change:false},
        {name: 'tradePrice', displayName: '最新成交价', nowState: true,change:false},
        {name: 'tradeVol', displayName: '最新成交量', nowState: true,change:false},
        {name: 'tradeTime', displayName: '最新成交时间', nowState: true,change:false}
    ],
    mainFiledList : [
    	{name: 'a1', displayName: 'Outright', nowState: true,change:false},
        {name: 'a2', displayName: '活跃', nowState: true,change:false},
        {name: 'a3', displayName: '非活跃Repo', nowState: true,change:false},
        {name: 'a4', displayName: '长期限', nowState: true,change:false},
        {name: 'a5', displayName: '短期限', nowState: true,change:false},
    ],
    mainColumnsData : {
        productKey:"productKey",

        myOfr: "myOfr",
        myOfrVol: "myOfrVol",
        myOfrOrderId: "myOfrOrderId",

        myBid: "myBid",
        myBidVol: "myBidVol",
        myBidOrderId: "myBidOrderId",

        mktOfr: "mktOfr",
        mktOfrVol: "mktOfrVol",
        mktBestOfr:"mktBestOfr",
        mktOfrSource: "mktOfrSource",
        mktOfrUpdateTime: "mktOfrUpdateTime",

        mktBid: "mktBid",
        mktBidVol: "mktBidVol",
        mktBestBid:"mktBestBid",
        mktBidSource: "mktBidSource",
        mktBidTime: "mktBidTime",

        mktMidPrice: "mktMidPrice",
        prevClosePrice: "prevClosePrice",
        tradePrice: "tradePrice",
        tradeVol: "tradeVol",
        tradeTime: "tradeTime",
        tradeType:"tradeType",
    },
    pageInfo : [
		{"name":"deal","index":1,"type":"getTradeHistory"},
		{"name":"order","index":1,"type":"getOrderHistory"},
		{"name":"swap","index":1,"type":""}
	]
});