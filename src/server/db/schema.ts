import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  numeric,
  date,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('role', ['admin', 'user'])
export const waitlistStatusEnum = pgEnum('waitlist_status', ['pending', 'invited', 'rejected'])
export const sessionTypeEnum = pgEnum('session_type', ['round', 'range', 'short_game'])
export const sessionEntryMethodEnum = pgEnum('session_entry_method', ['voice', 'form', 'both'])
export const shotEntryMethodEnum = pgEnum('shot_entry_method', ['voice', 'form', 'cv_assisted'])
export const cameraAngleEnum = pgEnum('camera_angle', ['dtl', 'face_on', 'unknown'])
export const clipProcessingStatusEnum = pgEnum('clip_processing_status', [
  'pending',
  'processing',
  'complete',
  'failed',
])
export const lieEnum = pgEnum('lie', [
  'tee',
  'fairway',
  'rough',
  'deep_rough',
  'sand',
  'recovery',
  'fringe',
  'green',
])
export const shotResultEnum = pgEnum('shot_result', [
  'fairway',
  'left_rough',
  'right_rough',
  'sand',
  'ob',
  'water',
  'green',
  'holed',
])
export const shotShapeEnum = pgEnum('shot_shape', [
  'straight',
  'draw',
  'fade',
  'hook',
  'slice',
  'push',
  'pull',
])
export const sgSourceEnum = pgEnum('sg_source', ['calculated', 'arccos_override', 'manual'])
export const cvProcessingStatusEnum = pgEnum('cv_processing_status', [
  'pending',
  'queued',
  'processing',
  'complete',
  'failed',
])
export const tagSourceEnum = pgEnum('tag_source', [
  'auto_cv',
  'auto_whisper',
  'auto_nova',
  'user',
])
export const fairwayMissDirectionEnum = pgEnum('fairway_miss_direction', ['left', 'right'])

// ── Auth tables ──────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  isSystemAccount: boolean('is_system_account').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('idx_refresh_tokens_user_id').on(table.userId),
  }),
)

export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  message: text('message'),
  status: waitlistStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  actionedAt: timestamp('actioned_at', { withTimezone: true }),
})

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Telemetry ────────────────────────────────────────────────────────────────

export const telemetryEvents = pgTable(
  'telemetry_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: text('event_type').notNull(),
    userId: uuid('user_id').references(() => users.id),
    properties: jsonb('properties'),
    ipHash: text('ip_hash'),
    deviceType: text('device_type'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventTypeIdx: index('idx_telemetry_event_type').on(table.eventType),
    userIdIdx: index('idx_telemetry_user_id').on(table.userId),
    createdAtIdx: index('idx_telemetry_created_at').on(table.createdAt),
  }),
)

// ── Course data ──────────────────────────────────────────────────────────────

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    golfIntelligenceId: text('golf_intelligence_id'),
    name: text('name').notNull(),
    city: text('city'),
    state: text('state'),
    country: text('country').notNull().default('USA'),
    totalHoles: integer('total_holes').notNull().default(18),
    isManuallyEntered: boolean('is_manually_entered').notNull().default(false),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    golfIntelligenceIdIdx: index('idx_courses_golf_intelligence_id').on(
      table.golfIntelligenceId,
    ),
  }),
)

export const courseTees = pgTable(
  'course_tees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    teeName: text('tee_name').notNull(),
    teeColor: text('tee_color'),
    totalYards: integer('total_yards'),
    courseRating: numeric('course_rating', { precision: 4, scale: 1 }),
    slopeRating: integer('slope_rating'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    courseTeeName: unique('uq_course_tees_course_tee').on(table.courseId, table.teeName),
  }),
)

export const courseHoles = pgTable(
  'course_holes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    teeId: uuid('tee_id')
      .notNull()
      .references(() => courseTees.id, { onDelete: 'cascade' }),
    holeNumber: integer('hole_number').notNull(),
    par: integer('par').notNull(),
    yards: integer('yards'),
    handicapIndex: integer('handicap_index'),
    isModified: boolean('is_modified').notNull().default(false),
    modificationNote: text('modification_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    teeHoleNumber: unique('uq_course_holes_tee_hole').on(table.teeId, table.holeNumber),
  }),
)

// ── Golf session data ────────────────────────────────────────────────────────

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: sessionTypeEnum('type').notNull(),
    sessionDate: date('session_date').notNull(),
    courseId: uuid('course_id').references(() => courses.id),
    teeId: uuid('tee_id').references(() => courseTees.id),
    teeUsed: text('tee_used'),
    weatherConditions: text('weather_conditions'),
    temperatureF: integer('temperature_f'),
    windDescription: text('wind_description'),
    notes: text('notes'),
    entryMethod: sessionEntryMethodEnum('entry_method'),
    arccosRoundId: text('arccos_round_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
    typeIdx: index('idx_sessions_type').on(table.type),
  }),
)

export const holeSummaries = pgTable(
  'hole_summaries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    holeNumber: integer('hole_number').notNull(),
    par: integer('par'),
    score: integer('score'),
    fairwayHit: boolean('fairway_hit'),
    fairwayMissDirection: fairwayMissDirectionEnum('fairway_miss_direction'),
    gir: boolean('gir'),
    putts: integer('putts'),
    penaltyStrokes: integer('penalty_strokes').notNull().default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionHoleUniq: unique('uq_hole_summaries_session_hole').on(
      table.sessionId,
      table.holeNumber,
    ),
    sessionIdIdx: index('idx_hole_summaries_session_id').on(table.sessionId),
  }),
)

export const clips = pgTable(
  'clips',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    sessionId: uuid('session_id').references(() => sessions.id),
    blobUrl: text('blob_url').notNull(),
    filename: text('filename').notNull(),
    durationSeconds: integer('duration_seconds'),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
    cameraAngle: cameraAngleEnum('camera_angle'),
    angleConfidence: numeric('angle_confidence', { precision: 4, scale: 3 }),
    captureTimestamp: timestamp('capture_timestamp', { withTimezone: true }),
    gpmfDeviceName: text('gpmf_device_name'),
    transcript: text('transcript'),
    transcriptConfidence: numeric('transcript_confidence', { precision: 4, scale: 3 }),
    processingStatus: clipProcessingStatusEnum('processing_status').notNull().default('pending'),
    processingError: text('processing_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_clips_user_id').on(table.userId),
    sessionIdIdx: index('idx_clips_session_id').on(table.sessionId),
    processingStatusIdx: index('idx_clips_processing_status').on(table.processingStatus),
  }),
)

export const shots = pgTable(
  'shots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id),
    holeNumber: integer('hole_number'),
    shotNumber: integer('shot_number'),
    club: text('club'),
    distanceYards: numeric('distance_yards', { precision: 6, scale: 1 }),
    lie: lieEnum('lie'),
    shotResult: shotResultEnum('shot_result'),
    shotShape: shotShapeEnum('shot_shape'),
    pinDistanceFeet: numeric('pin_distance_feet', { precision: 6, scale: 1 }),
    sgTotal: numeric('sg_total', { precision: 5, scale: 3 }),
    sgOffTee: numeric('sg_off_tee', { precision: 5, scale: 3 }),
    sgApproach: numeric('sg_approach', { precision: 5, scale: 3 }),
    sgAroundGreen: numeric('sg_around_green', { precision: 5, scale: 3 }),
    sgPutting: numeric('sg_putting', { precision: 5, scale: 3 }),
    sgSource: sgSourceEnum('sg_source').notNull().default('calculated'),
    entryMethod: shotEntryMethodEnum('entry_method'),
    voiceTranscript: text('voice_transcript'),
    shotTimestamp: timestamp('shot_timestamp', { withTimezone: true }),
    arccosShotId: text('arccos_shot_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_shots_user_id').on(table.userId),
    sessionIdIdx: index('idx_shots_session_id').on(table.sessionId),
  }),
)

export const shotClips = pgTable('shot_clips', {
  id: uuid('id').primaryKey().defaultRandom(),
  shotId: uuid('shot_id')
    .notNull()
    .references(() => shots.id, { onDelete: 'cascade' }),
  clipId: uuid('clip_id')
    .notNull()
    .references(() => clips.id),
  trimmedBlobUrl: text('trimmed_blob_url'),
  trimStartSeconds: numeric('trim_start_seconds', { precision: 8, scale: 3 }),
  trimEndSeconds: numeric('trim_end_seconds', { precision: 8, scale: 3 }),
  ballFlightData: jsonb('ball_flight_data'),
  poseLandmarksDtl: jsonb('pose_landmarks_dtl'),
  poseLandmarksFo: jsonb('pose_landmarks_fo'),
  arcOverlayBlobUrl: text('arc_overlay_blob_url'),
  cvProcessingStatus: cvProcessingStatusEnum('cv_processing_status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const shotTags = pgTable(
  'shot_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shotId: uuid('shot_id')
      .notNull()
      .references(() => shots.id, { onDelete: 'cascade' }),
    tagCategory: text('tag_category').notNull(),
    tagKey: text('tag_key').notNull(),
    tagValue: text('tag_value').notNull(),
    measuredValue: text('measured_value'),
    source: tagSourceEnum('source').notNull(),
    confidence: numeric('confidence', { precision: 4, scale: 3 }),
    userConfirmed: boolean('user_confirmed'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    shotIdIdx: index('idx_shot_tags_shot_id').on(table.shotId),
  }),
)

export const clarificationQueue = pgTable('clarification_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  clipId: uuid('clip_id')
    .notNull()
    .references(() => clips.id),
  signals: jsonb('signals'),
  suggestedAngle: text('suggested_angle'),
  suggestedHole: integer('suggested_hole'),
  suggestedShots: jsonb('suggested_shots'),
  confidence: numeric('confidence', { precision: 4, scale: 3 }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolution: jsonb('resolution'),
  learnFromResolution: boolean('learn_from_resolution').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// SG baseline lookup (Broadie tables — seeded in Issue 004)
export const sgBaseline = pgTable(
  'sg_baseline',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lie: text('lie').notNull(),
    distanceYards: integer('distance_yards').notNull(),
    expectedStrokes: numeric('expected_strokes', { precision: 5, scale: 3 }).notNull(),
  },
  (table) => ({
    lieDist: unique('uq_sg_baseline_lie_distance').on(table.lie, table.distanceYards),
  }),
)

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  invites: many(invites),
  sessions: many(sessions),
  clips: many(clips),
  shots: many(shots),
  holeSummaries: many(holeSummaries),
  courses: many(courses),
  clarificationQueue: many(clarificationQueue),
  telemetryEvents: many(telemetryEvents),
}))

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}))

export const invitesRelations = relations(invites, ({ one }) => ({
  createdBy: one(users, { fields: [invites.createdBy], references: [users.id] }),
}))

export const telemetryEventsRelations = relations(telemetryEvents, ({ one }) => ({
  user: one(users, { fields: [telemetryEvents.userId], references: [users.id] }),
}))

export const coursesRelations = relations(courses, ({ one, many }) => ({
  createdBy: one(users, { fields: [courses.createdBy], references: [users.id] }),
  tees: many(courseTees),
  holes: many(courseHoles),
}))

export const courseTeeRelations = relations(courseTees, ({ one, many }) => ({
  course: one(courses, { fields: [courseTees.courseId], references: [courses.id] }),
  holes: many(courseHoles),
}))

export const courseHolesRelations = relations(courseHoles, ({ one }) => ({
  course: one(courses, { fields: [courseHoles.courseId], references: [courses.id] }),
  tee: one(courseTees, { fields: [courseHoles.teeId], references: [courseTees.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  course: one(courses, { fields: [sessions.courseId], references: [courses.id] }),
  tee: one(courseTees, { fields: [sessions.teeId], references: [courseTees.id] }),
  shots: many(shots),
  holeSummaries: many(holeSummaries),
  clips: many(clips),
}))

export const holeSummariesRelations = relations(holeSummaries, ({ one }) => ({
  user: one(users, { fields: [holeSummaries.userId], references: [users.id] }),
  session: one(sessions, { fields: [holeSummaries.sessionId], references: [sessions.id] }),
}))

export const clipsRelations = relations(clips, ({ one, many }) => ({
  user: one(users, { fields: [clips.userId], references: [users.id] }),
  session: one(sessions, { fields: [clips.sessionId], references: [sessions.id] }),
  shotClips: many(shotClips),
  clarificationQueue: many(clarificationQueue),
}))

export const shotsRelations = relations(shots, ({ one, many }) => ({
  user: one(users, { fields: [shots.userId], references: [users.id] }),
  session: one(sessions, { fields: [shots.sessionId], references: [sessions.id] }),
  shotClips: many(shotClips),
  shotTags: many(shotTags),
}))

export const shotClipsRelations = relations(shotClips, ({ one }) => ({
  shot: one(shots, { fields: [shotClips.shotId], references: [shots.id] }),
  clip: one(clips, { fields: [shotClips.clipId], references: [clips.id] }),
}))

export const shotTagsRelations = relations(shotTags, ({ one }) => ({
  shot: one(shots, { fields: [shotTags.shotId], references: [shots.id] }),
}))

export const clarificationQueueRelations = relations(clarificationQueue, ({ one }) => ({
  user: one(users, { fields: [clarificationQueue.userId], references: [users.id] }),
  clip: one(clips, { fields: [clarificationQueue.clipId], references: [clips.id] }),
}))
