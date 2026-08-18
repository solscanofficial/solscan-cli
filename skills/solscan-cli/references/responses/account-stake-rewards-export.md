# Account Stake Rewards Export

> Export rewards for an account. Staking reward data is available from epoch 132. Maximum 5,000 items per request. If no time filter is provided, the API returns staking rewards from the past 1 month. Rate limit: 10 requests per minute.

## Notes

- This is a PRO endpoint from Solscan API V2.

## Endpoint Information

- Category: `Account APIs`
- Method: `GET`
- Route name: `/v2-account-reward-export`
- Reference route: `/reference//v2-account-reward-export`
- Markdown route: `/reference//v2-account-reward-export.md`
- API URL: `https://pro-api.solscan.io/v2.0/account/reward/export`

### Query Parameters

### `address`

- Type: `string`
- Required: Yes
- Description: A wallet address on solana blockchain. Staking reward data is available from epoch 132


### `from_time`

- Type: `number`
- Required: No
- Description: The start time for the export. Format: Unix timestamp in seconds. Default 1 month before to_time


### `to_time`

- Type: `number`
- Required: No
- Description: The end time for the export. Format: Unix timestamp in seconds. Default current time.


### `time_from`

- Type: `number`
- Required: No
- Description: The start time for the export. Format: Unix time in seconds. Default 1 month before time_to
- Deprecated: Yes


### `time_to`

- Type: `number`
- Required: No
- Description: The end time for the export. Format: Unix time in seconds. Default current time.
- Deprecated: Yes


## Request Example

```bash
curl --request GET \
  --url 'https://pro-api.solscan.io/v2.0/account/reward/export?address=YOUR_ADDRESS&from_time=1&to_time=1&time_from=1&time_to=1' \
  --header 'token: YOUR_API_KEY'
```
## Response Example

```json
"Epoch, Effective Slot, Effective Time Unix, Effective Time, Reward Amount, Change Percentage, Post Balance, Commission\n972,420336000,1779020765,2026-05-17T19:26:05,0,0,0.777802943,0"
```
## Response Details

### 200 OK

#### Schema
```json
{
  "type": "string",
  "example": "Epoch, Effective Slot, Effective Time Unix, Effective Time, Reward Amount, Change Percentage, Post Balance, Commission\n972,420336000,1779020765,2026-05-17T19:26:05,0,0,0.777802943,0"
}
```

#### Example
```json
"Epoch, Effective Slot, Effective Time Unix, Effective Time, Reward Amount, Change Percentage, Post Balance, Commission\n972,420336000,1779020765,2026-05-17T19:26:05,0,0,0.777802943,0"
```

### 400 Bad Request

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
      "code": 1100,
      "message": "Validation Error: Address [TmUEfZi6dHe7DcFq2ALvB2tbB] is invalid"
    }
  }
}
```

#### Example
```json
{
  "success": false,
  "errors": {
    "code": 1100,
    "message": "Validation Error: Address [TmUEfZi6dHe7DcFq2ALvB2tbB] is invalid"
  }
}
```

### 401 Authentication failed

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
      "code": 401,
      "message": "Token is invalid"
    }
  }
}
```

#### Example
```json
{
  "success": false,
  "errors": {
    "code": 401,
    "message": "Token is invalid"
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
