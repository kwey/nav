module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
          "impliedStrict": true
        }
    },
    "env": {
    "es6": true,
    "worker": true,
    "node": true,
    "browser": true,
    "jquery": true
    },
    "rules": {
        "indent": [
            2,
            4,
            {
                "SwitchCase": 1
            }
        ],
        "no-new-wrappers": 1,  // new Number String Boolean ...
        "no-param-reassign": 1, // 不改变参数
        "no-plusplus": 1, // ++
        "prefer-template": 1, // ++
        "no-unused-expressions": 0, // ++
    }
};