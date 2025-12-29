export const MarketingOrderReceivedDomExp = (sequelize, Sequelize) => {
  
  const MarketingOrderReceivedDomExp = sequelize.define("MarketingOrderReceivedDomExp",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      contractName: {
        type: Sequelize.TEXT,
      },

      customerName: {
        type: Sequelize.TEXT,
      },
      customerAddress: {
        type: Sequelize.TEXT,
      },

      orderReceicedDate: {
        type: Sequelize.STRING,
      },
      purchaseOrder: {
        type: Sequelize.STRING,
        primaryKey:true
      },
      typeOfTender: {
        type: Sequelize.STRING,
      },
      valueWithoutGST: {
        type: Sequelize.STRING,
      },
      valueWithGST: {
        type: Sequelize.STRING,
      },
      JSON_competitors: {
        type: Sequelize.TEXT,
      },
      remarks: {
        type: Sequelize.STRING,
      },
      contractCopy: {
        type: Sequelize.STRING,
      },

      OperatorId: {
        type: Sequelize.STRING,
      },
      
      OperatorName: {
        type: Sequelize.STRING
      },
      OperatorRole: {
        type: Sequelize.STRING,
      },
      OperatorSBU: {
        type: Sequelize.STRING,
      },
      FileName: {
        type: Sequelize.JSON
      },
      FilePath: {
        type: Sequelize.JSON
      },
      HardDiskFileName: {
        type: Sequelize.JSON
      },
      Dom_or_Export: {
        type: Sequelize.TEXT
      },
  });

  //console.log(MarketingOrderReceivedDomExp)

  return MarketingOrderReceivedDomExp;
};


