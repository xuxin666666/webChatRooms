create Table if NOT exists `users` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '给用户用的标识',
    `gender` TINYINT DEFAULT 0 COMMENT '0：未知，1：男，2：女',
    `message_alert` TINYINT DEFAULT 0 COMMENT '是否开启消息提醒，0，1',
    `message_system` TINYINT DEFAULT 1 COMMENT '是否接收系统通知，0，1',
    `system_message_read` INT DEFAULT 0 COMMENT '系统消息已读序号，与system_messages的id相对应',
    `other_message_read` TINYINT DEFAULT 1 COMMENT '其他消息是否已读，0，1',
    `blocked_time` BIGINT(13) DEFAULT 0 COMMENT '封号结束时间，时间戳，0表示未封号',
    `create_time` BIGINT(13) NOT NULL COMMENT '账号创建时间，时间戳',
    `last_online` BIGINT(13) DEFAULT 0 COMMENT '上次登录时间，时间戳',
    `birthday` BIGINT(13) DEFAULT 0 COMMENT '生日',
    `uid` VARCHAR(50) NOT NULL collate utf8mb4_general_ci COMMENT '随机生成的用户id',
    `username` VARCHAR(20) NOT NULL collate utf8mb4_general_ci,
    `password` VARCHAR(100) NOT NULL collate utf8mb4_general_ci,
    `email` VARCHAR(20) NOT NULL collate utf8mb4_general_ci,
    `avatar` VARCHAR(50) DEFAULT 'defaultUser.png' collate utf8mb4_general_ci,
    `role` VARCHAR(20) DEFAULT 'normal' collate utf8mb4_general_ci COMMENT 'normal, admin, seniorAdmin, topAdmin',
    `signature` VARCHAR(100) DEFAULT 'Hello Word!' collate utf8mb4_general_ci COMMENT '个性签名',
    PRIMARY KEY(`id`)
) engine = InnoDB AUTO_INCREMENT = 100000001 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;

create Table if NOT exists `groups` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '给群的标识',
    `max_num` INT DEFAULT 100 COMMENT '群管理最大人数',
    `create_time` BIGINT(13) NOT NULL COMMENT '群创建时间，时间戳',
    `gid` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
    `name` VARCHAR(20) NOT NULL collate utf8mb4_general_ci,
    `description` VARCHAR(1000) NOT NULL collate utf8mb4_general_ci,
    `owner` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
    -- `admins` VARCHAR(5000) DEFAULT '' collate utf8mb4_general_ci COMMENT '管理员，uid，每个管理员用,隔开',
    `avatar` VARCHAR(50) DEFAULT 'defaultGroup.png' collate utf8mb4_general_ci,
    PRIMARY KEY(`id`)
) engine = InnoDB AUTO_INCREMENT = 500000001 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;

create Table `uid_groups` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `read` TINYINT DEFAULT 1 COMMENT '是否已读',
    `group` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
    PRIMARY KEY(`id`)
) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;

create Table `uid_messages` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(100) NOT NULL collate utf8mb4_general_ci,
    `create_time` BIGINT(13) NOT NULL,
    PRIMARY KEY(`id`)
) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;

create Table `system_messages` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(100) NOT NULL collate utf8mb4_general_ci,
    `create_time` BIGINT(13) NOT NULL,
    PRIMARY KEY(`id`)
) engine = InnoDB AUTO_INCREMENT = 1 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;

create Table `gid_members` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `member` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
    `role` VARCHAR(50) DEFAULT 'normal' collate utf8mb4_general_ci COMMENT 'normal, admin, owner',
    PRIMARY KEY(`id`)
) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;

create Table `gid_contents` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(1000) NOT NULL collate utf8mb4_general_ci,
    `publisher` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
    `type` VARCHAR(10) NOT NULL collate utf8mb4_general_ci COMMENT 'text, image',
    `create_time` BIGINT(13) NOT NULL,
    PRIMARY KEY(`id`)
) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;