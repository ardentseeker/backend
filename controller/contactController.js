import { dynamoClient, TABLE_NAME } from "../config/dynamoClient.js";
import { v4 as uuidv4 } from "uuid";

// ➕ Create Contact
export const createContact = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone)
    return res.status(400).json({ error: "All fields are required" });

  const contact = {
    id: uuidv4(),
    name,
    email,
    phone,
    createdAt: new Date().toISOString(),
  };

  try {
    await dynamoClient
      .put({
        TableName: TABLE_NAME,
        Item: contact,
      })
      .promise();

    res.status(201).json({ message: "Contact created successfully", contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create contact" });
  }
};

// ✏️ Update Contact
export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "set #n = :n, email = :e, phone = :p",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":n": name,
        ":e": email,
        ":p": phone,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoClient.update(params).promise();

    res.status(200).json({ message: "Contact updated", updated: result.Attributes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update contact" });
  }
};

// ❌ Delete Contact
export const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    await dynamoClient
      .delete({
        TableName: TABLE_NAME,
        Key: { id },
      })
      .promise();

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

// ➿ Get all Contacts
export const getContacts = async (req, res) => {
  try {
    const result = await dynamoClient.scan({ TableName: TABLE_NAME }).promise();
    res.status(200).json({ contacts: result.Items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// 🔎 Get contact by id
export const getContactById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dynamoClient
      .get({ TableName: TABLE_NAME, Key: { id } })
      .promise();

    if (!result.Item) return res.status(404).json({ error: "Contact not found" });

    res.status(200).json({ contact: result.Item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
};
