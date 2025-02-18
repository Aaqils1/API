/////////



const express = require('express')
const app = express()
const mongoose = require('mongoose');
require('dotenv').config();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


// Connect to the remote MongoDB database
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.log('Error connecting to MongoDB', error.message);
});

// IMPORT TREE DATA

const myTreeSchema = new mongoose.Schema({
  id: Number,
  Location: Number,
  Devices:[Number]
},
 { collection: 'Trees' }); // specify the name of the collection here

// Create a Mongoose model for the collection
const myTree = mongoose.model('Trees', myTreeSchema);



// Import Client data

const myClientSchema = new mongoose.Schema({
  name: String,
  clientId: Number,
  Farms: [Number]
},
 { collection: 'Client' }); // specify the name of the collection here
// Create a Mongoose model for the collection
const myClient = mongoose.model('Client', myClientSchema);

// Import Device Data

const myDeviceSchema = new mongoose.Schema({
  DeviceId: Number,
  Connected_tree: [Number],
  name: String,
}, { collection: 'Device' });

const myDevice = mongoose.model('Device', myDeviceSchema);

//

// Import Farms data
const myFarmSchema = new mongoose.Schema({
name: String,
id: Number,
farmId: Number,
No_of_trees:[Number]
},
{ collection: 'Farms' }); // specify the name of the collection here
// Create a Mongoose model for the collection
const myFarm = mongoose.model('Farms', myFarmSchema);

// Define the OpenAPI options
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sample API',
        version: '1.0.0',
      },
    },
    apis: ['./main.js'],
  };
  
  // Initialize the swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

// /**
// *components:
// * schemas:
// *   Farm:
// *     type: object
// *     properties:
// *       name:
// *         type: string
// *       id:
// *         type: integer
// *       farmId:
// *         type: integer
// *       No_of_trees:
// *         type: array
// *         items:
// *           type: integer

//  */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome User
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get('/', (req, res) => {
    res.send('Welcome User');
  });

  
  // Query to get value from Farms


/**
 * @swagger
 * /farm:
 *   get:
 *     summary: Get Farms data
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: integer
 *         description: Filter by farmId
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by farm name
 *       - in: query
 *         name: No_of_trees
 *         schema:
 *           type: integer
 *         description: Filter by the number of trees
 *       - in: query
 *         name: maximise
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Specify whether to include tree information
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Farm'
 */

 

  app.get('/farm', async (req, res) => {
    const farmId = req.query.farmId;
    const name = req.query.name;
    const no_of_tree = req.query.No_of_trees
  
    const query = {};
  
    if (farmId) {
      query.farmId = { $eq: Number(farmId)};
    }
  
    if (name) {
      query.name = { $eq: name};
    }
    
    if (no_of_tree) {
    
      query.No_of_trees = { $eq: Number(no_of_tree)};
    }
      const maximise = req.query.maximise;
      if (maximise === '1'){
       
        try {
          const result2 = await myFarm.aggregate([
           {
            $lookup: {
              from: 'Trees',
              localField: 'No_of_trees',
              foreignField: 'id', // Update the foreignField to the appropriate field in the Farms collection
              as: 'tree_info'
            }
                },
            {
              $match: query
            }
          ]).exec();
          const json = JSON.stringify(result2);
          res.send(json);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      } else {
        try {
          const result2 = await myFarm.find(query).exec();
          const json = JSON.stringify(result2);
          res.send(json);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      }
    }
    );
   //




    
  /**
   * @swagger
   * /client:
   *   get:
   *     summary: Get Client data
   *     parameters:
   *       - in: query
   *         name: clientId
   *         schema:
   *           type: integer
   *         description: Filter by clientId
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filter by client name
   *       - in: query
   *         name: Farms
   *         schema:
   *           type: integer
   *         description: Filter by farm Id connected to the client
   *       - in: query
   *         name: maximise
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *         description: Specify whether to include farm information
   *     responses:
   *       '200':
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               type: array
  //  *               items:
  //  *                 $ref: '#/components/schemas/Client'
   */

  //Query to get value from client(Also Client connected to farms)


  
app.get('/client', async (req, res) => {
  const query = {};

  const clientId = req.query.clientId;
  if (clientId) {
    query.clientId = { $eq: Number(clientId) };
  }

  const name = req.query.name;
  if (name) {
    query.name = { $eq: name };
  }

  const farms = req.query.Farms;
  if (farms) {
    query.Farms = { $eq: Number(farms) };
  }

  const maximise = req.query.maximise;
  if (maximise === '1')
   {
    try {
      const result = await myClient.aggregate([
        {
          $lookup: {
            from: 'Farms',
            localField: 'Farms',
            foreignField: 'farmId',
            as: 'farm_info'
          }
        },
        {
          $match: query
        }
      ]).exec();
      const json = JSON.stringify(result);
      res.send(json);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    try {
      const result = await myClient.find(query).exec();
      const json = JSON.stringify(result);
      res.send(json);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
});

  //
  //Query to get value from devices (Also device connected to trees)

 
  
/**
 * @swagger
 * /device:
 *   get:
 *     summary: Get Device data
 *     parameters:
 *       - in: query
 *         name: DeviceId
 *         schema:
 *           type: integer
 *         description: Filter by DeviceId
 *       - in: query
 *         name: Connected_tree
 *         schema:
 *           type: integer
 *         description: Filter by connected tree Id
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by device name
 *       - in: query
 *         name: maximise
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Specify whether to include tree information
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Device'
 */
  app.get('/device', async (req, res) => {
    const DeviceId = req.query.DeviceId;
    const connectedTrees = req.query.Connected_tree;
    const name = req.query.name;
  
    const query = {};
  
    if (DeviceId) {
      query.DeviceId = { $eq: Number(DeviceId)};
    }
  
    if (name) {
      query.name = { $eq: name};
    }
  
    if (connectedTrees) {
    
      query.Connected_tree = { $eq: Number(connectedTrees)};
    
    }
      const maximise = req.query.maximise;
      if (maximise === '1')
       {
        try {
          const result1 = await myDevice.aggregate([
            {
              $lookup: {
                from: 'Trees',
                localField: 'Connected_tree',
                foreignField: 'id', // Update the foreignField to the appropriate field in the Farms collection
                as: 'tree_info'
              }
            },
            {
              $match: query
            }
          ]).exec();
          const json = JSON.stringify(result1);
          res.send(json);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      } else {
        try {
          const result1 = await myDevice.find(query).exec();
          const json = JSON.stringify(result1);
          res.send(json);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      }
    }
  );


  
/**
 * @swagger
 * /tree:
 *   get:
 *     summary: Get Tree data
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filter by tree Id
 *       - in: query
 *         name: Location
 *         schema:
 *           type: integer
 *         description: Filter by tree location
 *       - in: query
 *         name: Devices
 *         schema:
 *           type: integer
 *         description: Filter by device Id connected to the tree
 *       - in: query
 *         name: maximise
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Specify whether to include device information
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 * 
 *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Tree'
 */

  //Query to get the value from tree
  
  app.get('/tree', async (req, res) => {
    const id = req.query.id;
    const location = req.query.Location;
    const device = req.query.Devices;

  const query = {};

  if (id) {
    query.id = { $eq: id};
  }

  if (location) {
    query.Location = { $eq: location};
  }
  
  if (device) {
  
    query.Devices = { $eq: Number(device)};
  }
  const maximise = req.query.maximise;
      if (maximise === '1')
       {
        try {
          const result1 = await myDevice.aggregate([
            {
              $lookup: {
                from: 'Device',
                localField: 'Devices',
                foreignField: 'DeviceId', // Update the foreignField to the appropriate field in the Farms collection
                as: 'device_info'
              }
            },
            {
              $match: query
            }
          ]).exec();
          const json = JSON.stringify(result1);
          res.send(json);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      } else {
        try {
          const result1 = await myDevice.find(query).exec();
          const json = JSON.stringify(result1);
          res.send(json);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      }
    }
  );

  //


  
//

app.listen(7202, ()=>{
  console.log("Listening to port 7202")
})
