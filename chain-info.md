# Chain Information

> Blockchain overall information

## Notes

- This is a public Solscan API endpoint.

## Endpoint Information

- Category: `Chain Information`
- Method: `GET`
- Route name: `/chaininfo`
- Reference route: `/reference//chaininfo`
- Markdown route: `/reference//chaininfo.md`
- API URL: `https://public-api.solscan.io/chaininfo`

## Request Example

```bash
curl --request GET \
  --url 'https://public-api.solscan.io/chaininfo' \
  
```
## Response Example

```json
{
  "success": true,
  "data": {
    "blockHeight": 93077733,
    "currentEpoch": 239,
    "absoluteSlot": 103591629,
    "transactionCount": 35454233802
  }
}
```
## Response Details

### 200 OK

#### Schema
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Status of Api"
    },
    "data": {
      "type": "object",
      "properties": {
        "blockHeight": {
          "type": "number",
          "description": "Number of confirmed block"
        },
        "currentEpoch": {
          "type": "number",
          "description": "Current epoch"
        },
        "absoluteSlot": {
          "type": "number",
          "description": "The total number of slots that have been produced since the genesis block, including empty or skipped slots."
        },
        "transactionCount": {
          "type": "number",
          "description": "The cumulative total number of transactions processed on the blockchain from genesis up to this block."
        }
      }
    }
  },
  "example": {
    "success": true,
    "data": {
      "blockHeight": 93077733,
      "currentEpoch": 239,
      "absoluteSlot": 103591629,
      "transactionCount": 35454233802
    }
  }
}
```

#### Example
```json
{
  "success": true,
  "data": {
    "blockHeight": 93077733,
    "currentEpoch": 239,
    "absoluteSlot": 103591629,
    "transactionCount": 35454233802
  }
}
```

### 429 Too Many Requests

#### Schema
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Status of Api"
    },
    "errors": {
      "type": "object",
      "properties": {
        "code": {
          "type": "number",
          "description": "Error Code for API"
        },
        "message": {
          "type": "string",
          "description": "Message to describe error"
        }
      }
    }
  },
  "example": {
    "success": false,
    "errors": {
      "code": 429,
      "message": "Too many requests, please try again later."
    }
  }
}
```

#### Example
```json
{
  "success": false,
  "errors": {
    "code": 429,
    "message": "Too many requests, please try again later."
  }
}
```

### 500 Internal Server Error

#### Schema
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Status of Api"
    },
    "errors": {
      "type": "object",
      "properties": {
        "code": {
          "type": "number",
          "description": "Error Code for API"
        },
        "message": {
          "type": "string",
          "description": "Message to describe error"
        }
      }
    }
  },
  "example": {
    "success": false,
    "errors": {
      "code": 500,
      "message": "Internal Server Error"
    }
  }
}
```

#### Example
```json
{
  "success": false,
  "errors": {
    "code": 500,
    "message": "Internal Server Error"
  }
}
```
