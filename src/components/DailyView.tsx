import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace } from '../types';
import { getTasksForDay } from '../utils/dateHelpers';
import { differenceInMinutes, startOfDay, endOfDay, isSameDay } from 'date-fns';
import TaskCard from './TaskCard';

interface DailyViewProps {
    date: Date;
    tasks: Task[];
    taskSpaces: TaskSpace[];
    onTaskPress: (task: Task) => void;
    onToggleComplete?: (task: Task) => void;
    onToggleChecklistItem?: (taskId: string, itemId: string) => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
}

interface TaskLayout {
    left: string;
    width: string;
    isOverflow: boolean;
}

const HOUR_HEIGHT = 60;
const TIME_COLUMN_WIDTH = 50;

export default function DailyView({
    date,
    tasks,
    taskSpaces,
    onTaskPress,
    onToggleComplete,
    onToggleChecklistItem,
}: DailyViewProps) {
    const { colors } = useTheme();
    const dayTasks = getTasksForDay(tasks, date);
    const [overflowTask, setOverflowTask] = React.useState<Task | null>(null);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getTaskSpaceColor = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.color || colors.primary;
    };

    const getTaskSpaceName = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.name || 'General';
    };

    const scrollViewRef = React.useRef<ScrollView>(null);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        if (isSameDay(date, new Date())) {
            const minutes = new Date().getHours() * 60 + new Date().getMinutes();
            const offset = (minutes / 60) * HOUR_HEIGHT - 100;
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, offset), animated: true });
            }, 100);
        }

        return () => clearInterval(timer);
    }, [date]);

    const getTaskPosition = (task: Task) => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const taskStart = new Date(task.startTime);
        const taskEnd = new Date(task.endTime);
        const effectiveStart = taskStart < dayStart ? dayStart : taskStart;
        const effectiveEnd = taskEnd > dayEnd ? dayEnd : taskEnd;
        const startMinutes = differenceInMinutes(effectiveStart, dayStart);
        const durationMinutes = differenceInMinutes(effectiveEnd, effectiveStart);
        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = (durationMinutes / 60) * HOUR_HEIGHT;
        return { top, height };
    };

    const getTaskLayouts = (tasks: Task[]): { layouts: Record<string, TaskLayout>, overflowTasks: Task[] } => {
        const layouts: Record<string, TaskLayout> = {};
        const overflowTasks: Task[] = [];
        const sortedTasks = [...tasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        const overlappingGroups: Task[][] = [];
        const processedTasks = new Set<string>();

        // First: identify overlapping groups
        sortedTasks.forEach(task => {
            if (processedTasks.has(task.id)) return;

            const group: Task[] = [task];
            const taskStart = new Date(task.startTime).getTime();
            const taskEnd = new Date(task.endTime).getTime();

            sortedTasks.forEach(otherTask => {
                if (task.id === otherTask.id || processedTasks.has(otherTask.id)) return;
                const otherStart = new Date(otherTask.startTime).getTime();
                const otherEnd = new Date(otherTask.endTime).getTime();
                if (taskStart < otherEnd && taskEnd > otherStart) {
                    group.push(otherTask);
                }
            });

            if (group.length > 1) {
                overlappingGroups.push(group);
                group.forEach(t => processedTasks.add(t.id));
            }
        });

        // Second: assign layouts
        // Process overlapping groups first
        overlappingGroups.forEach(group => {
            const columns: Task[][] = [[], []];
            const sortedGroup = [...group].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

            sortedGroup.forEach(groupTask => {
                const taskStart = new Date(groupTask.startTime).getTime();
                let placed = false;

                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    const lastTask = col[col.length - 1];

                    if (!lastTask || new Date(lastTask.endTime).getTime() <= taskStart) {
                        col.push(groupTask);
                        layouts[groupTask.id] = { left: i === 0 ? '0%' : '50%', width: '50%', isOverflow: false };
                        placed = true;
                        break;
                    }
                }

                if (!placed) {
                    overflowTasks.push(groupTask);
                    layouts[groupTask.id] = { left: '90%', width: '10%', isOverflow: true };
                }
            });
        });

        // Then process non-overlapping tasks
        sortedTasks.forEach(task => {
            if (!processedTasks.has(task.id)) {
                layouts[task.id] = { left: '0%', width: '100%', isOverflow: false };
            }
        });

        return { layouts, overflowTasks };
    };

    const { layouts, overflowTasks } = React.useMemo(() => getTaskLayouts(dayTasks), [dayTasks]);

    const CurrentTimeLine = () => {
        if (!isSameDay(date, currentTime)) return null;
        const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const top = (minutes / 60) * HOUR_HEIGHT;
        return (
            <View style={[styles.currentTimeLine, { top }]}>
                <View style={styles.currentTimeDot} />
            </View>
        );
    };

    const OverflowModal = () => {
        if (!overflowTask) return null;
        return (
            <Modal transparent visible={!!overflowTask} animationType="fade" onRequestClose={() => setOverflowTask(null)}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg }}
                    activeOpacity={1}
                    onPress={() => setOverflowTask(null)}
                >
                    <View style={{ backgroundColor: colors.background.primary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, maxHeight: '80%' }}>
                        <Text style={{ fontSize: FONT_SIZES.lg, fontWeight: 'bold', marginBottom: SPACING.md, color: colors.text.primary }}>
                            Overlapping Tasks
                        </Text>
                        <ScrollView>
                            {overflowTasks.map(task => (
                                <View key={task.id} style={{ marginBottom: SPACING.md }}>
                                    <TaskCard
                                        task={task}
                                        spaceColor={getTaskSpaceColor(task.taskSpaceId)}
                                        spaceName={getTaskSpaceName(task.taskSpaceId)}
                                        onPress={() => {
                                            setOverflowTask(null);
                                            onTaskPress(task);
                                        }}
                                        onToggleComplete={() => onToggleComplete?.(task)}
                                        onToggleChecklistItem={(itemId) => onToggleChecklistItem?.(task.id, itemId)}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: { flex: 1, flexDirection: 'row' },
        timeColumn: { width: TIME_COLUMN_WIDTH, backgroundColor: colors.background.primary, borderRightWidth: 1, borderRightColor: colors.border },
        timeLabel: { height: HOUR_HEIGHT, textAlign: 'center', color: colors.text.tertiary, fontSize: FONT_SIZES.xs, transform: [{ translateY: -8 }] },
        tasksColumn: { flex: 1, position: 'relative', height: 24 * HOUR_HEIGHT },
        gridLine: { height: HOUR_HEIGHT, borderBottomWidth: 1, borderBottomColor: colors.border, opacity: 0.3 },
        taskWrapper: { position: 'absolute', left: SPACING.xs, right: SPACING.xs, zIndex: 1 },
        currentTimeLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.error, zIndex: 10 },
        currentTimeDot: { position: 'absolute', left: -4, top: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
        emptyState: { padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xxl },
        emptyStateText: { color: colors.text.secondary, fontSize: FONT_SIZES.md, textAlign: 'center' },
    }), [colors]);

    return (
        <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.timeColumn}>
                    {hours.map((hour) => (
                        <Text key={hour} style={styles.timeLabel}>{`${hour.toString().padStart(2, '0')}:00`}</Text>
                    ))}
                </View>
                <View style={styles.tasksColumn}>
                    {hours.map((hour) => (
                        <View key={`grid-${hour}`} style={styles.gridLine} />
                    ))}
                    <CurrentTimeLine />
                    {dayTasks.map((task) => {
                        const { top, height } = getTaskPosition(task);
                        const layout = layouts[task.id] || { left: '0%', width: '100%', isOverflow: false };

                        if (layout.isOverflow) {
                            return (
                                <TouchableOpacity key={task.id} style={[styles.taskWrapper, { top, left: layout.left as any, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', zIndex: 10 }]} onPress={() => setOverflowTask(task)}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 10 }}>+{overflowTasks.length}</Text>
                                </TouchableOpacity>
                            );
                        }

                        const isOverlapping = layout.width !== '100%';

                        return (
                            <View key={task.id} style={[styles.taskWrapper, { top, height: Math.max(height, 20), left: layout.left as any, width: layout.width as any }]}>
                                <TaskCard task={task} spaceColor={getTaskSpaceColor(task.taskSpaceId)} spaceName={getTaskSpaceName(task.taskSpaceId)} onPress={() => onTaskPress(task)} onToggleComplete={() => onToggleComplete?.(task)} onToggleChecklistItem={(itemId) => onToggleChecklistItem?.(task.id, itemId)} compact={height <= 80 || isOverlapping} isOverlapping={isOverlapping} style={{ flex: 1 }} />
                            </View>
                        );
                    })}
                    {dayTasks.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No tasks scheduled for today</Text>
                        </View>
                    )}
                </View>
            </View>
            <OverflowModal />
        </ScrollView>
    );
}
